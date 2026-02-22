import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class DisputesService {
    constructor(
        @InjectRepository(Dispute) private disputesRepo: Repository<Dispute>,
        private uploadsService: UploadsService,
    ) { }

    async create(
        data: { emergencyId: string; raisedBy: string; reason: string },
        evidenceFiles?: Express.Multer.File[],
    ) {
        let evidenceUrls: string[] = [];
        if (evidenceFiles?.length) {
            evidenceUrls = await this.uploadsService.processMultiple(evidenceFiles, 'dispute-evidence');
        }

        const dispute = this.disputesRepo.create({
            ...data,
            evidenceUrls,
            status: 'open',
        });
        return this.disputesRepo.save(dispute);
    }

    async findAll(page = 1, limit = 20) {
        const [disputes, total] = await this.disputesRepo.findAndCount({
            relations: ['emergency', 'emergency.user', 'emergency.provider'],
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { disputes, total, page, totalPages: Math.ceil(total / limit) };
    }

    async resolve(id: string, status: string, adminNotes?: string) {
        const dispute = await this.disputesRepo.findOne({ where: { id } });
        if (!dispute) throw new NotFoundException('Dispute not found');

        dispute.status = status;
        dispute.adminNotes = adminNotes || '';
        dispute.resolvedAt = new Date();
        return this.disputesRepo.save(dispute);
    }
}
