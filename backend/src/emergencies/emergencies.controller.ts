import {
    Controller, Get, Post, Put, Body, Param, Query,
    UseGuards, Request, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmergenciesService } from './emergencies.service';
import { multerOptions } from '../uploads/multer.config';

@ApiTags('emergencies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergencies')
export class EmergenciesController {
    constructor(private emergenciesService: EmergenciesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new emergency request' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('photos', 5, multerOptions))
    create(@Request() req, @Body() data: any, @UploadedFiles() photos: Express.Multer.File[]) {
        const parsed = {
            categoryId: data.categoryId,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            addressText: data.addressText,
            questionnaireAnswers: typeof data.questionnaireAnswers === 'string'
                ? JSON.parse(data.questionnaireAnswers) : data.questionnaireAnswers,
        };
        return this.emergenciesService.create(req.user.sub, parsed, photos);
    }

    @Get('history')
    @ApiOperation({ summary: 'Get emergency history' })
    getHistory(@Request() req, @Query('page') page = 1) {
        return this.emergenciesService.getHistory(req.user.sub, +page);
    }

    @Get('incoming')
    @ApiOperation({ summary: 'Get incoming jobs for provider' })
    getIncoming(@Request() req) {
        return this.emergenciesService.getIncomingJobs(req.user.sub);
    }

    @Get('active')
    @ApiOperation({ summary: 'Get provider active job' })
    getActive(@Request() req) {
        return this.emergenciesService.getProviderActiveJob(req.user.sub);
    }

    @Get(':id/status')
    @ApiOperation({ summary: 'Get emergency status' })
    getStatus(@Param('id') id: string) {
        return this.emergenciesService.getStatus(id);
    }

    @Post(':id/accept')
    @ApiOperation({ summary: 'Provider accepts emergency job' })
    accept(@Request() req, @Param('id') id: string, @Body() body: { quotedPrice: number }) {
        return this.emergenciesService.acceptJob(id, req.user.sub, body.quotedPrice);
    }

    @Put(':id/arrived')
    @ApiOperation({ summary: 'Provider marks arrived' })
    arrived(@Request() req, @Param('id') id: string) {
        return this.emergenciesService.markArrived(id, req.user.sub);
    }

    @Put(':id/completed')
    @ApiOperation({ summary: 'Provider marks job completed' })
    completed(@Request() req, @Param('id') id: string) {
        return this.emergenciesService.markCompleted(id, req.user.sub);
    }

    @Post(':id/confirm')
    @ApiOperation({ summary: 'User confirms issue is resolved' })
    confirm(@Request() req, @Param('id') id: string) {
        return this.emergenciesService.confirm(id, req.user.sub);
    }

    @Post(':id/dispute')
    @ApiOperation({ summary: 'User disputes the service' })
    @UseInterceptors(FilesInterceptor('evidence', 3, multerOptions))
    dispute(
        @Request() req,
        @Param('id') id: string,
        @Body() body: { reason: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.emergenciesService.dispute(id, req.user.sub, body.reason, files);
    }
}
