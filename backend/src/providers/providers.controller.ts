import {
    Controller, Get, Post, Put, Body, Param, Query,
    UseGuards, Request, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProvidersService } from './providers.service';
import { multerOptions } from '../uploads/multer.config';

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProvidersController {
    constructor(private providersService: ProvidersService) { }

    @Post('register')
    @ApiOperation({ summary: 'Complete provider registration with ID upload' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'photo', maxCount: 1 },
                { name: 'idProof', maxCount: 1 },
            ],
            multerOptions,
        ),
    )
    register(
        @Request() req,
        @Body() data: any,
        @UploadedFiles() files: { photo?: Express.Multer.File[]; idProof?: Express.Multer.File[] },
    ) {
        const categoryIds = typeof data.categoryIds === 'string'
            ? JSON.parse(data.categoryIds)
            : data.categoryIds;
        return this.providersService.register(
            req.user.sub,
            { ...data, categoryIds },
            files?.photo?.[0],
            files?.idProof?.[0],
        );
    }

    @Put('toggle-online')
    @ApiOperation({ summary: 'Go online or offline' })
    toggleOnline(@Request() req, @Body() body: { isOnline: boolean }) {
        return this.providersService.toggleOnline(req.user.sub, body.isOnline);
    }

    @Put('update-location')
    @ApiOperation({ summary: 'Update provider GPS location' })
    updateLocation(@Request() req, @Body() body: { latitude: number; longitude: number }) {
        return this.providersService.updateLocation(req.user.sub, body.latitude, body.longitude);
    }

    @Get('earnings')
    @ApiOperation({ summary: 'Get earnings summary' })
    getEarnings(@Request() req) {
        return this.providersService.getEarnings(req.user.sub);
    }

    @Get('nearby')
    @ApiOperation({ summary: 'Find nearby providers for user' })
    getNearby(
        @Query('lat') lat: number,
        @Query('long') long: number,
        @Query('radius') radius: number = 10,
        @Query('categoryId') categoryId?: string,
    ) {
        return this.providersService.findNearby(+lat, +long, categoryId || '', +radius);
    }

    @Get('profile')
    @ApiOperation({ summary: 'Get own provider profile' })
    getProfile(@Request() req) {
        return this.providersService.findById(req.user.sub);
    }
}
