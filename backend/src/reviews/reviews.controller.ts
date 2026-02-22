import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a review for a completed emergency' })
    create(@Request() req, @Body() body: { emergencyId: string; providerId: string; rating: number; comment?: string }) {
        return this.reviewsService.create({ ...body, userId: req.user.sub });
    }

    @Get('provider/:providerId')
    @ApiOperation({ summary: 'Get reviews for a provider' })
    getByProvider(@Param('providerId') id: string) {
        return this.reviewsService.getByProviderId(id);
    }
}
