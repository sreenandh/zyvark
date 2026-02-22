import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { CategoriesModule } from './categories/categories.module';
import { EmergenciesModule } from './emergencies/emergencies.module';
import { UploadsModule } from './uploads/uploads.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './gateway/events.module';
import { SettingsModule } from './settings/settings.module';

@Module({
    imports: [
        // Config
        ConfigModule.forRoot({ isGlobal: true }),

        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get('DB_USERNAME', 'postgres'),
                password: config.get('DB_PASSWORD', 'postgres'),
                database: config.get('DB_NAME', 'rescuenow'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: config.get('NODE_ENV') !== 'production',
                logging: config.get('NODE_ENV') === 'development',
                retryAttempts: 5,
                retryDelay: 3000,
            }),
        }),

        // Rate limiting
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

        // Scheduled tasks
        ScheduleModule.forRoot(),

        // Feature modules
        AuthModule,
        UsersModule,
        ProvidersModule,
        CategoriesModule,
        EmergenciesModule,
        UploadsModule,
        PaymentsModule,
        ReviewsModule,
        DisputesModule,
        NotificationsModule,
        AdminModule,
        EventsModule,
        SettingsModule,
    ],
})
export class AppModule { }
