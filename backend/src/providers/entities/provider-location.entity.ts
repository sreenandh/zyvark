import {
    Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn,
} from 'typeorm';
import { Provider } from './provider.entity';

@Entity('provider_locations')
export class ProviderLocation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    providerId: string;

    @OneToOne(() => Provider, (provider) => provider.location, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'providerId' })
    provider: Provider;

    @Column('decimal', { precision: 10, scale: 8 })
    latitude: number;

    @Column('decimal', { precision: 11, scale: 8 })
    longitude: number;

    @Column({ default: false })
    isOnline: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}
