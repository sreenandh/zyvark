import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToMany, OneToOne,
} from 'typeorm';
import { ProviderSkill } from './provider-skill.entity';
import { ProviderLocation } from './provider-location.entity';

@Entity('providers')
export class Provider {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 15, unique: true })
    phone: string;

    @Column({ nullable: true })
    photoUrl: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    idProofUrl: string;

    @Column({ default: false })
    aadhaarVerified: boolean;

    @Column({ default: 'pending' })
    status: string; // 'pending' | 'approved' | 'rejected' | 'suspended'

    @Column('decimal', { precision: 3, scale: 2, default: 0 })
    reliabilityScore: number;

    @Column({ type: 'text', nullable: true })
    otp: string | null;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiresAt: Date | null;

    @Column({ nullable: true })
    serviceRadius: number; // in km

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => ProviderSkill, (skill) => skill.provider)
    skills: ProviderSkill[];

    @OneToOne(() => ProviderLocation, (location) => location.provider)
    location: ProviderLocation;
}
