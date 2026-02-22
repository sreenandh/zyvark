import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

const DEFAULT_SETTINGS = [
    { key: 'platformFeePercent', value: '10', type: 'number', description: 'Platform fee percentage' },
    { key: 'providerSearchRadiusKm', value: '15', type: 'number', description: 'Search radius in km' },
    { key: 'searchTimeoutSeconds', value: '15', type: 'number', description: 'Search timeout in seconds' },
    { key: 'maxPhotosPerEmergency', value: '3', type: 'number', description: 'Max photos allowed' },
    { key: 'autoApproveProviders', value: 'false', type: 'boolean', description: 'Auto approve providers' },
];

@Injectable()
export class SettingsService implements OnModuleInit {
    constructor(
        @InjectRepository(Setting)
        private settingsRepo: Repository<Setting>,
    ) { }

    async onModuleInit() {
        for (const defaultSetting of DEFAULT_SETTINGS) {
            const exists = await this.settingsRepo.findOne({ where: { key: defaultSetting.key } });
            if (!exists) {
                await this.settingsRepo.save(defaultSetting);
            }
        }
    }

    async findAll() {
        const settings = await this.settingsRepo.find();
        return settings.reduce((acc, setting) => {
            let value: any = setting.value;
            if (setting.type === 'number') value = parseFloat(setting.value);
            if (setting.type === 'boolean') value = setting.value === 'true';
            acc[setting.key] = value;
            return acc;
        }, {});
    }

    async update(updateDto: Record<string, any>) {
        for (const [key, value] of Object.entries(updateDto)) {
            const setting = await this.settingsRepo.findOne({ where: { key } });
            if (setting) {
                setting.value = String(value);
                await this.settingsRepo.save(setting);
            }
        }
        return this.findAll();
    }
}
