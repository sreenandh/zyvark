import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category) private categoriesRepo: Repository<Category>,
    ) { }

    findAll() {
        return this.categoriesRepo.find({ order: { name: 'ASC' } });
    }

    findById(id: string) {
        return this.categoriesRepo.findOne({ where: { id } });
    }

    create(data: Partial<Category>) {
        const category = this.categoriesRepo.create(data);
        return this.categoriesRepo.save(category);
    }

    async update(id: string, data: Partial<Category>) {
        await this.categoriesRepo.update(id, data);
        return this.findById(id);
    }

    async seed() {
        // Upsert: insert only categories that don't already exist
        const existing = await this.categoriesRepo.find();
        const existingNames = new Set(existing.map(c => c.name));

        const categories = [
            {
                name: 'Electricity',
                icon: '⚡',
                description: 'Electrical emergencies - power failure, short circuit, sparking',
                minPrice: 200,
                maxPrice: 2000,
                smartQuestions: [
                    { question: 'Is there sparking or burning smell?', type: 'yes_no' },
                    { question: 'Is the issue in one room or entire house?', type: 'single_choice', options: ['One Room', 'Entire House'] },
                    { question: 'Has the MCB/fuse tripped?', type: 'yes_no' },
                ],
            },
            {
                name: 'Water / Plumbing',
                icon: '💧',
                description: 'Water leaks, pipe bursts, drainage issues',
                minPrice: 200,
                maxPrice: 3000,
                smartQuestions: [
                    { question: 'Is there active water leaking?', type: 'yes_no' },
                    { question: 'What type of issue?', type: 'single_choice', options: ['Pipe Leak', 'Blocked Drain', 'No Water Supply', 'Tap/Fixture Issue'] },
                    { question: 'Is it in the bathroom or kitchen?', type: 'single_choice', options: ['Bathroom', 'Kitchen', 'Other'] },
                ],
            },
            {
                name: 'Vehicle Breakdown',
                icon: '🚗',
                description: 'Vehicle breakdown, flat tyre, battery dead, engine issues',
                minPrice: 300,
                maxPrice: 5000,
                smartQuestions: [
                    { question: 'What type of vehicle?', type: 'single_choice', options: ['Two Wheeler', 'Car', 'SUV', 'Other'] },
                    { question: 'What is the issue?', type: 'single_choice', options: ['Flat Tyre', 'Battery Dead', 'Engine Won\'t Start', 'Overheating', 'Other'] },
                    { question: 'Are you on a highway?', type: 'yes_no' },
                ],
            },
            {
                name: 'AC Repair',
                icon: '❄️',
                description: 'AC not cooling, gas leak, compressor issue, unusual noise',
                minPrice: 300,
                maxPrice: 4000,
                smartQuestions: [
                    { question: 'What type of AC?', type: 'single_choice', options: ['Window AC', 'Split AC', 'Central AC'] },
                    { question: 'What is the issue?', type: 'single_choice', options: ['Not Cooling', 'Water Leaking', 'Unusual Noise', 'Not Turning On', 'Gas Refill Needed'] },
                    { question: 'Is the AC under warranty?', type: 'yes_no' },
                ],
            },
            {
                name: 'Fridge Repair',
                icon: '🧊',
                description: 'Refrigerator not cooling, ice buildup, compressor noise',
                minPrice: 300,
                maxPrice: 3500,
                smartQuestions: [
                    { question: 'What type of refrigerator?', type: 'single_choice', options: ['Single Door', 'Double Door', 'Side-by-Side', 'Mini Fridge'] },
                    { question: 'What is the issue?', type: 'single_choice', options: ['Not Cooling', 'Over Cooling/Ice Buildup', 'Unusual Noise', 'Water Leaking', 'Not Turning On'] },
                    { question: 'Is it under warranty?', type: 'yes_no' },
                ],
            },
            {
                name: 'Washing Machine',
                icon: '🫧',
                description: 'Washing machine not spinning, water issues, error codes',
                minPrice: 300,
                maxPrice: 3000,
                smartQuestions: [
                    { question: 'What type?', type: 'single_choice', options: ['Top Load', 'Front Load', 'Semi-Automatic'] },
                    { question: 'What is the issue?', type: 'single_choice', options: ['Not Spinning', 'Water Not Draining', 'Unusual Noise', 'Error Code', 'Not Turning On'] },
                    { question: 'Is it under warranty?', type: 'yes_no' },
                ],
            },
            {
                name: 'Locksmith',
                icon: '🔒',
                description: 'Locked out, key broken, lock change, safe opening',
                minPrice: 200,
                maxPrice: 2500,
                smartQuestions: [
                    { question: 'What happened?', type: 'single_choice', options: ['Locked Out', 'Key Broken in Lock', 'Lock Damaged', 'Need Lock Change', 'Safe/Locker Issue'] },
                    { question: 'What type of lock?', type: 'single_choice', options: ['Door Lock', 'Padlock', 'Car Lock', 'Digital Lock', 'Safe'] },
                    { question: 'Is it an emergency/urgent?', type: 'yes_no' },
                ],
            },
            {
                name: 'Carpentry',
                icon: '🪚',
                description: 'Door, window, furniture repair, wood work',
                minPrice: 300,
                maxPrice: 5000,
                smartQuestions: [
                    { question: 'What needs repair?', type: 'single_choice', options: ['Door', 'Window', 'Furniture', 'Cabinet/Shelf', 'Other Wood Work'] },
                    { question: 'What type of work?', type: 'single_choice', options: ['Repair/Fix', 'New Installation', 'Replacement'] },
                    { question: 'Do you have the materials?', type: 'yes_no' },
                ],
            },
            {
                name: 'Painting',
                icon: '🎨',
                description: 'Wall painting, touch-up, waterproofing, wall damage',
                minPrice: 500,
                maxPrice: 10000,
                smartQuestions: [
                    { question: 'What type of work?', type: 'single_choice', options: ['Touch-up', 'Full Room Paint', 'Waterproofing', 'Wall Damage Repair'] },
                    { question: 'How many rooms/walls?', type: 'single_choice', options: ['1 Wall', '1 Room', '2-3 Rooms', 'Full House'] },
                    { question: 'Do you have the paint?', type: 'yes_no' },
                ],
            },
            {
                name: 'Cleaning',
                icon: '🧹',
                description: 'Deep clean, pest control, drain cleaning, sanitization',
                minPrice: 500,
                maxPrice: 5000,
                smartQuestions: [
                    { question: 'What type of cleaning?', type: 'single_choice', options: ['Deep Cleaning', 'Pest Control', 'Drain Cleaning', 'Bathroom Cleaning', 'Kitchen Cleaning', 'Full House'] },
                    { question: 'Size of space?', type: 'single_choice', options: ['1 BHK', '2 BHK', '3 BHK', 'Bungalow/Villa', 'Office/Commercial'] },
                    { question: 'Is it an urgent/same-day requirement?', type: 'yes_no' },
                ],
            },
            {
                name: 'Geyser / Water Heater',
                icon: '🔥',
                description: 'Geyser repair, installation, no hot water, leaking',
                minPrice: 300,
                maxPrice: 3000,
                smartQuestions: [
                    { question: 'What type?', type: 'single_choice', options: ['Electric Geyser', 'Gas Geyser', 'Solar Water Heater', 'Instant Heater'] },
                    { question: 'What is the issue?', type: 'single_choice', options: ['No Hot Water', 'Water Leaking', 'Not Turning On', 'Making Noise', 'New Installation'] },
                    { question: 'Is it under warranty?', type: 'yes_no' },
                ],
            },
            {
                name: 'Water Tank / RO',
                icon: '🚰',
                description: 'Water tank overflow, RO purifier repair, filter change',
                minPrice: 200,
                maxPrice: 2500,
                smartQuestions: [
                    { question: 'What is the issue?', type: 'single_choice', options: ['Water Tank Overflow', 'RO Not Working', 'Filter Change Needed', 'Motor Issue', 'Water Quality Issue'] },
                    { question: 'What brand (if RO)?', type: 'single_choice', options: ['Kent', 'Aquaguard', 'Pureit', 'Other', 'Not Applicable'] },
                    {
                        question: 'Is annual maintenance due?', type: 'yes_no'
                    },
                ],
            },
            {
                name: 'Others',
                icon: '❓',
                description: 'Any other emergency service not listed above',
                minPrice: 200,
                maxPrice: 5000,
                smartQuestions: [
                    { question: 'Please describe the issue in detail', type: 'single_choice', options: ['Hardware Issue', 'Software Issue', 'Physical Damage', 'Unknown Issue', 'Other'] },
                    { question: 'Is it urgent?', type: 'yes_no' },
                ],
            },
        ];

        const newCategories = categories.filter(c => !existingNames.has(c.name));
        if (newCategories.length === 0) {
            return { message: 'All categories already exist', count: existing.length };
        }
        const saved = await this.categoriesRepo.save(newCategories);
        return { message: 'Categories seeded', newCount: saved.length, totalCount: existing.length + saved.length };
    }
}
