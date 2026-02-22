import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    ) { }

    async create(data: { emergencyId: string; userId: string; providerId: string; rating: number; comment?: string }) {
        const review = this.reviewsRepo.create(data);
        const saved = await this.reviewsRepo.save(review);

        // Update provider reliability score (average of all ratings)
        const result = await this.reviewsRepo
            .createQueryBuilder('r')
            .select('AVG(r.rating)', 'avg')
            .where('r.providerId = :pid', { pid: data.providerId })
            .getRawOne();

        if (result?.avg) {
            await this.reviewsRepo.query(
                `UPDATE providers SET "reliabilityScore" = $1 WHERE id = $2`,
                [parseFloat(result.avg).toFixed(2), data.providerId],
            );
        }

        return saved;
    }

    getByProviderId(providerId: string) {
        return this.reviewsRepo.find({
            where: { providerId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
}
