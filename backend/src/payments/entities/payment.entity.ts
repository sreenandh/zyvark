import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Emergency } from '../../emergencies/entities/emergency.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    emergencyId: string;

    @ManyToOne(() => Emergency)
    @JoinColumn({ name: 'emergencyId' })
    emergency: Emergency;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ length: 30, nullable: true })
    paymentMethod: string;

    @Column({ length: 20, nullable: true })
    escrowStatus: string; // 'held' | 'released' | 'refunded'

    @Column({ nullable: true })
    razorpayOrderId: string;

    @Column({ nullable: true })
    razorpayPaymentId: string;

    @Column({ nullable: true })
    paidAt: Date;

    @Column({ nullable: true })
    releasedAt: Date;

    @Column({ nullable: true })
    refundedAt: Date;
}
