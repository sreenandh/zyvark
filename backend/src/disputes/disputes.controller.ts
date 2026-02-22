import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DisputesService } from './disputes.service';
import { multerOptions } from '../uploads/multer.config';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
    constructor(private disputesService: DisputesService) { }

    @Post()
    @ApiOperation({ summary: 'Raise a dispute' })
    @UseInterceptors(FilesInterceptor('evidence', 3, multerOptions))
    create(
        @Request() req,
        @Body() body: { emergencyId: string; reason: string },
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.disputesService.create(
            { ...body, raisedBy: req.user.role },
            files,
        );
    }
}
