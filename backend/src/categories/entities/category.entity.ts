import {
    Entity, PrimaryGeneratedColumn, Column, OneToMany,
} from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50, nullable: true })
    icon: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    minPrice: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    maxPrice: number;

    @Column({ type: 'jsonb', nullable: true })
    smartQuestions: any[]; // Array of { question: string, type: 'yes_no' | 'single_choice', options?: string[] }
}
