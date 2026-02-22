import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // CORS — reads allowed origins from env (comma-separated)
    app.enableCors({
        origin: true, // Allow all origins for development
        credentials: true,
    });

    // Validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Serve uploaded files statically
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('RescueNow API')
        .setDescription('Emergency Response Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management')
        .addTag('providers', 'Service provider management')
        .addTag('emergencies', 'Emergency job management')
        .addTag('categories', 'Emergency categories')
        .addTag('payments', 'Payment & escrow')
        .addTag('reviews', 'Ratings & reviews')
        .addTag('disputes', 'Dispute resolution')
        .addTag('uploads', 'File uploads')
        .addTag('admin', 'Admin panel')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚨 RescueNow API running on http://localhost:${port}`);
    console.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
