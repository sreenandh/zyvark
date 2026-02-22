import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emergency, EmergencyStatus } from './entities/emergency.entity';
import { Provider } from '../providers/entities/provider.entity';
import { ProvidersService } from '../providers/providers.service';
import { UploadsService } from '../uploads/uploads.service';

const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

@Injectable()
export class EmergenciesService {
    constructor(
        @InjectRepository(Emergency) private emergenciesRepo: Repository<Emergency>,
        private providersService: ProvidersService,
        private uploadsService: UploadsService,
    ) { }

    async create(
        userId: string,
        data: {
            categoryId: string;
            latitude: number;
            longitude: number;
            addressText?: string;
            questionnaireAnswers?: any;
        },
        photos?: Express.Multer.File[],
    ) {
        let photoUrls: string[] = [];
        if (photos?.length) {
            photoUrls = await this.uploadsService.processMultiple(photos, 'emergency-photos');
        }

        const emergency = this.emergenciesRepo.create({
            userId,
            categoryId: data.categoryId,
            latitude: data.latitude,
            longitude: data.longitude,
            addressText: data.addressText,
            questionnaireAnswers: data.questionnaireAnswers,
            photoUrls,
            status: EmergencyStatus.PENDING,
        });

        const saved = await this.emergenciesRepo.save(emergency);

        // Find nearby providers
        const nearbyProviders = await this.providersService.findNearby(
            data.latitude,
            data.longitude,
            data.categoryId,
        );

        return {
            emergency: saved,
            nearbyProviders: nearbyProviders.length,
            message: nearbyProviders.length > 0
                ? `Found ${nearbyProviders.length} providers nearby. Broadcasting request...`
                : 'No providers found nearby. Expanding search area...',
        };
    }

    async getStatus(id: string) {
        const emergency = await this.emergenciesRepo.findOne({
            where: { id },
            relations: ['user', 'provider', 'category'],
        });
        if (!emergency) throw new NotFoundException('Emergency not found');
        return emergency;
    }

    async acceptJob(emergencyId: string, providerId: string, quotedPrice: number) {
        const emergency = await this.emergenciesRepo.findOne({ where: { id: emergencyId } });
        if (!emergency) throw new NotFoundException('Emergency not found');
        if (emergency.status !== EmergencyStatus.PENDING) {
            throw new BadRequestException('This emergency has already been accepted');
        }

        const platformFee = Math.round(quotedPrice * PLATFORM_FEE_PERCENT) / 100;
        const totalPrice = quotedPrice + platformFee;

        emergency.providerId = providerId;
        emergency.quotedPrice = quotedPrice;
        emergency.platformFee = platformFee;
        emergency.totalPrice = totalPrice;
        emergency.status = EmergencyStatus.ACCEPTED;
        emergency.acceptedAt = new Date();

        return this.emergenciesRepo.save(emergency);
    }

    async markArrived(emergencyId: string, providerId: string) {
        const emergency = await this.emergenciesRepo.findOne({
            where: { id: emergencyId, providerId },
        });
        if (!emergency) throw new NotFoundException('Emergency not found');

        emergency.status = EmergencyStatus.ARRIVED;
        emergency.arrivedAt = new Date();
        return this.emergenciesRepo.save(emergency);
    }

    async markCompleted(emergencyId: string, providerId: string) {
        const emergency = await this.emergenciesRepo.findOne({
            where: { id: emergencyId, providerId },
        });
        if (!emergency) throw new NotFoundException('Emergency not found');

        emergency.status = EmergencyStatus.COMPLETED;
        emergency.completedAt = new Date();
        return this.emergenciesRepo.save(emergency);
    }

    async confirm(emergencyId: string, userId: string) {
        const emergency = await this.emergenciesRepo.findOne({
            where: { id: emergencyId, userId },
        });
        if (!emergency) throw new NotFoundException('Emergency not found');

        emergency.status = EmergencyStatus.CONFIRMED;
        emergency.escrowStatus = 'released';
        emergency.confirmedAt = new Date();
        return this.emergenciesRepo.save(emergency);
    }

    async dispute(
        emergencyId: string,
        userId: string,
        reason: string,
        evidenceFiles?: Express.Multer.File[],
    ) {
        const emergency = await this.emergenciesRepo.findOne({
            where: { id: emergencyId, userId },
        });
        if (!emergency) throw new NotFoundException('Emergency not found');

        emergency.status = EmergencyStatus.DISPUTED;
        emergency.escrowStatus = 'held';
        return this.emergenciesRepo.save(emergency);
    }

    async getHistory(userId: string, page = 1, limit = 20) {
        const [emergencies, total] = await this.emergenciesRepo.findAndCount({
            where: { userId },
            relations: ['provider', 'category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { emergencies, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getIncomingJobs(providerId: string) {
        return this.emergenciesRepo.find({
            where: { status: EmergencyStatus.PENDING },
            relations: ['user', 'category'],
            order: { createdAt: 'DESC' },
            take: 20,
        });
    }

    async getProviderActiveJob(providerId: string) {
        return this.emergenciesRepo.findOne({
            where: [
                { providerId, status: EmergencyStatus.ACCEPTED },
                { providerId, status: EmergencyStatus.ARRIVED },
                { providerId, status: EmergencyStatus.IN_PROGRESS },
            ],
            relations: ['user', 'category'],
        });
    }

    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [total, pending, active, completed, disputed] = await Promise.all([
            this.emergenciesRepo.count(),
            this.emergenciesRepo.count({ where: { status: EmergencyStatus.PENDING } }),
            this.emergenciesRepo.count({
                where: [
                    { status: EmergencyStatus.ACCEPTED },
                    { status: EmergencyStatus.ARRIVED },
                    { status: EmergencyStatus.IN_PROGRESS },
                ],
            }),
            this.emergenciesRepo.count({ where: { status: EmergencyStatus.CONFIRMED } }),
            this.emergenciesRepo.count({ where: { status: EmergencyStatus.DISPUTED } }),
        ]);

        // Today's orders
        const todayOrders = await this.emergenciesRepo
            .createQueryBuilder('e')
            .where('e.createdAt >= :today', { today })
            .getCount();

        // Revenue (total + today)
        const [totalRevRow, todayRevRow] = await Promise.all([
            this.emergenciesRepo
                .createQueryBuilder('e')
                .select('COALESCE(SUM(e.totalPrice), 0)', 'total')
                .where('e.escrowStatus = :s', { s: 'released' })
                .getRawOne(),
            this.emergenciesRepo
                .createQueryBuilder('e')
                .select('COALESCE(SUM(e.totalPrice), 0)', 'total')
                .where('e.escrowStatus = :s', { s: 'released' })
                .andWhere('e.confirmedAt >= :today', { today })
                .getRawOne(),
        ]);

        return {
            total,
            pending,
            active,
            completed,
            disputed,
            todayOrders,
            totalRevenue: parseFloat(totalRevRow.total),
            todayRevenue: parseFloat(todayRevRow.total),
            platformFeePercent: PLATFORM_FEE_PERCENT,
        };
    }

    async findAllAdmin(page = 1, limit = 20) {
        const [emergencies, total] = await this.emergenciesRepo.findAndCount({
            relations: ['user', 'provider', 'category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { emergencies, total, page, totalPages: Math.ceil(total / limit) };
    }
}
