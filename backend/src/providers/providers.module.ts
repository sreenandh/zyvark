import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { ProviderSkill } from './entities/provider-skill.entity';
import { ProviderLocation } from './entities/provider-location.entity';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Provider, ProviderSkill, ProviderLocation]),
        UploadsModule,
    ],
    controllers: [ProvidersController],
    providers: [ProvidersService],
    exports: [ProvidersService],
})
export class ProvidersModule { }
