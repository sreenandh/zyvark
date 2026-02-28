import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { EmergenciesModule } from '../emergencies/emergencies.module';
import { ProvidersModule } from '../providers/providers.module';
import { UsersModule } from '../users/users.module';
import { DisputesModule } from '../disputes/disputes.module';
import { PaymentsModule } from '../payments/payments.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
    imports: [EmergenciesModule, ProvidersModule, UsersModule, DisputesModule, PaymentsModule],
    controllers: [AdminController],
    providers: [RolesGuard],
})
export class AdminModule { }
