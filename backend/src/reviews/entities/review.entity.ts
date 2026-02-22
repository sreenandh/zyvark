import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Emergency } from '../../emergencies/entities/emergency.entity';
import { User } from '../../users/entities/user.entity';
import { Provider } from '../../providers/entities/provider.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    emergencyId: string;

    @ManyToOne(() => Emergency)
    @JoinColumn({ name: 'emergencyId' })
    emergency: Emergency;

    @Column()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    providerId: string;

    @ManyToOne(() => Provider)
    @JoinColumn({ name: 'providerId' })
    provider: Provider;

    @Column({ type: 'int' })
    rating: number; // 1-5

    @Column({ type: 'text', nullable: true })
    comment: string;

    @CreateDateColumn()
    createdAt: Date;
}
