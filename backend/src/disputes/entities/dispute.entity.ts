import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Emergency } from '../../emergencies/entities/emergency.entity';

@Entity('disputes')
export class Dispute {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    emergencyId: string;

    @ManyToOne(() => Emergency)
    @JoinColumn({ name: 'emergencyId' })
    emergency: Emergency;

    @Column({ length: 10 })
    raisedBy: string; // 'user' | 'provider'

    @Column({ type: 'text' })
    reason: string;

    @Column({ type: 'jsonb', nullable: true })
    evidenceUrls: string[];

    @Column({ default: 'open' })
    status: string; // 'open' | 'resolved' | 'rejected'

    @Column({ nullable: true })
    adminNotes: string;

    @Column({ nullable: true })
    resolvedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
