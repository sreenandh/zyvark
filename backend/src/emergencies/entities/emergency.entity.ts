import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';
import { Category } from '../../categories/entities/category.entity';

export enum EmergencyStatus {
    PENDING = 'pending',
    MATCHED = 'matched',
    ACCEPTED = 'accepted',
    ARRIVED = 'arrived',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CONFIRMED = 'confirmed',
    DISPUTED = 'disputed',
    CANCELLED = 'cancelled',
}

@Entity('emergencies')
export class Emergency {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    providerId: string;

    @ManyToOne(() => Provider, { nullable: true })
    @JoinColumn({ name: 'providerId' })
    provider: Provider;

    @Column()
    categoryId: string;

    @ManyToOne(() => Category)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ type: 'enum', enum: EmergencyStatus, default: EmergencyStatus.PENDING })
    status: EmergencyStatus;

    @Column('decimal', { precision: 10, scale: 8 })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'text', nullable: true })
    addressText: string;

    @Column({ type: 'jsonb', nullable: true })
    questionnaireAnswers: any;

    @Column({ type: 'jsonb', nullable: true })
    photoUrls: string[];

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    quotedPrice: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
    platformFee: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    totalPrice: number;

    @Column({ nullable: true, default: null })
    escrowStatus: string; // 'held' | 'released' | 'refunded'

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    acceptedAt: Date;

    @Column({ nullable: true })
    arrivedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    confirmedAt: Date;
}
