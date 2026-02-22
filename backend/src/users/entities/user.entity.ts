import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn, OneToMany,
} from 'typeorm';
import { UserAddress } from './user-address.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 15, unique: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    profilePhoto: string;

    @Column({ type: 'text', nullable: true })
    otp: string | null;

    @Column({ type: 'timestamp', nullable: true })
    otpExpiresAt: Date | null;

    @Column({ default: 'user' })
    role: string; // 'user' | 'admin'

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => UserAddress, (address) => address.user)
    addresses: UserAddress[];
}
