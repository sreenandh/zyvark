import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/user-address.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(UserAddress) private addressRepo: Repository<UserAddress>,
    ) { }

    async findById(id: string) {
        const user = await this.usersRepo.findOne({ where: { id }, relations: ['addresses'] });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateProfile(id: string, data: Partial<User>) {
        await this.usersRepo.update(id, data);
        return this.findById(id);
    }

    async addAddress(userId: string, data: Partial<UserAddress>) {
        const address = this.addressRepo.create({ ...data, userId });
        return this.addressRepo.save(address);
    }

    async getAddresses(userId: string) {
        return this.addressRepo.find({ where: { userId } });
    }

    async deleteAddress(userId: string, addressId: string) {
        const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
        if (!address) throw new NotFoundException('Address not found');
        return this.addressRepo.remove(address);
    }

    async findAll(page = 1, limit = 20) {
        const [users, total] = await this.usersRepo.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return { users, total, page, totalPages: Math.ceil(total / limit) };
    }
}
