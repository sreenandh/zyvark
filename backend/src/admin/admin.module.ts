import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { EmergenciesModule } from '../emergencies/emergencies.module';
import { ProvidersModule } from '../providers/providers.module';
import { UsersModule } from '../users/users.module';
import { DisputesModule } from '../disputes/disputes.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [EmergenciesModule, ProvidersModule, UsersModule, DisputesModule, PaymentsModule],
    controllers: [AdminController],
})
export class AdminModule { }
