import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CategoriesService } from '../categories/categories.service';

async function seedCategories() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    try {
        const categoriesService = app.get(CategoriesService);
        const result = await categoriesService.seed();
        console.log('Seed result:', result);
    } finally {
        await app.close();
    }
}

seedCategories().catch((error) => {
    console.error('Failed to seed categories:', error);
    process.exit(1);
});
