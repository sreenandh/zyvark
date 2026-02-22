import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all system settings' })
    findAll() {
        return this.settingsService.findAll();
    }

    @Patch()
    @ApiOperation({ summary: 'Update system settings' })
    update(@Body() updateDto: any) {
        return this.settingsService.update(updateDto);
    }
}
