import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergenciesService } from './emergencies.service';
import { EmergenciesController } from './emergencies.controller';
import { Emergency } from './entities/emergency.entity';
import { ProvidersModule } from '../providers/providers.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Emergency]),
        ProvidersModule,
        UploadsModule,
    ],
    controllers: [EmergenciesController],
    providers: [EmergenciesService],
    exports: [EmergenciesService],
})
export class EmergenciesModule { }
