import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from './entities/provider.entity';
import { ProviderSkill } from './entities/provider-skill.entity';
import { ProviderLocation } from './entities/provider-location.entity';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProvidersService {
    constructor(
        @InjectRepository(Provider) private providersRepo: Repository<Provider>,
        @InjectRepository(ProviderSkill) private skillsRepo: Repository<ProviderSkill>,
        @InjectRepository(ProviderLocation) private locationRepo: Repository<ProviderLocation>,
        private uploadsService: UploadsService,
    ) { }

    async register(
        providerId: string,
        data: { name: string; categoryIds: string[]; serviceRadius?: number },
        photo?: Express.Multer.File,
        idProof?: Express.Multer.File,
    ) {
        const provider = await this.providersRepo.findOne({ where: { id: providerId } });
        if (!provider) throw new NotFoundException('Provider not found');

        provider.name = data.name;
        provider.serviceRadius = data.serviceRadius || 10;

        if (photo) {
            provider.photoUrl = await this.uploadsService.processAndSave(photo, 'profiles');
        }
        if (idProof) {
            provider.idProofUrl = await this.uploadsService.processAndSave(idProof, 'id-proofs');
        }

        await this.providersRepo.save(provider);

        // Save skills
        if (data.categoryIds?.length) {
            await this.skillsRepo.delete({ providerId });
            const skills = data.categoryIds.map((categoryId) =>
                this.skillsRepo.create({ providerId, categoryId }),
            );
            await this.skillsRepo.save(skills);
        }

        return this.findById(providerId);
    }

    async findById(id: string) {
        return this.providersRepo.findOne({
            where: { id },
            relations: ['skills', 'skills.category', 'location'],
        });
    }

    async toggleOnline(providerId: string, isOnline: boolean) {
        let location = await this.locationRepo.findOne({ where: { providerId } });
        if (!location) {
            location = this.locationRepo.create({ providerId, latitude: 0, longitude: 0 });
        }
        location.isOnline = isOnline;
        return this.locationRepo.save(location);
    }

    async updateLocation(providerId: string, lat: number, lng: number) {
        let location = await this.locationRepo.findOne({ where: { providerId } });
        if (!location) {
            location = this.locationRepo.create({ providerId, isOnline: true });
        }
        location.latitude = lat;
        location.longitude = lng;
        return this.locationRepo.save(location);
    }

    async findNearby(lat: number, lng: number, categoryId: string, radiusKm = 15): Promise<Provider[]> {
        // Haversine distance calculation in SQL
        const providers = await this.providersRepo
            .createQueryBuilder('p')
            .innerJoin('p.skills', 'ps')
            .innerJoin('p.location', 'pl')
            .where('p.status = :status', { status: 'approved' })
            .andWhere('pl.isOnline = :online', { online: true })
            .andWhere('ps.categoryId = :categoryId', { categoryId })
            .andWhere(
                `(6371 * acos(cos(radians(:lat)) * cos(radians(pl.latitude)) * cos(radians(pl.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(pl.latitude)))) <= :radius`,
                { lat, lng, radius: radiusKm },
            )
            .orderBy(
                `(6371 * acos(cos(radians(:lat)) * cos(radians(pl.latitude)) * cos(radians(pl.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(pl.latitude))))`,
                'ASC',
            )
            .setParameters({ lat, lng })
            .limit(10)
            .getMany();

        return providers;
    }

    async getEarnings(providerId: string) {
        const result = await this.providersRepo.query(
            `SELECT 
        COUNT(*) as total_jobs,
        COALESCE(SUM(CASE WHEN e."escrowStatus" = 'released' THEN e."quotedPrice" ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN e."completedAt"::date = CURRENT_DATE AND e."escrowStatus" = 'released' THEN e."quotedPrice" ELSE 0 END), 0) as today_earned
       FROM emergencies e WHERE e."providerId" = $1 AND e.status IN ('completed', 'confirmed')`,
            [providerId],
        );
        return result[0] || { total_jobs: 0, total_earned: 0, today_earned: 0 };
    }

    async findAllPending(page = 1, limit = 20) {
        const [providers, total] = await this.providersRepo.findAndCount({
            where: { status: 'pending' },
            relations: ['skills', 'skills.category'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { providers, total, page, totalPages: Math.ceil(total / limit) };
    }

    async approve(id: string) {
        await this.providersRepo.update(id, { status: 'approved', aadhaarVerified: true });
        return this.findById(id);
    }

    async reject(id: string) {
        await this.providersRepo.update(id, { status: 'rejected' });
        return this.findById(id);
    }

    async findAll(page = 1, limit = 20) {
        const [providers, total] = await this.providersRepo.findAndCount({
            relations: ['skills', 'skills.category', 'location'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { providers, total, page, totalPages: Math.ceil(total / limit) };
    }
}
