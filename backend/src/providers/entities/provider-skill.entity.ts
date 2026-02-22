import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Provider } from './provider.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('provider_skills')
export class ProviderSkill {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    providerId: string;

    @ManyToOne(() => Provider, (provider) => provider.skills, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'providerId' })
    provider: Provider;

    @Column()
    categoryId: string;

    @ManyToOne(() => Category, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'categoryId' })
    category: Category;
}
