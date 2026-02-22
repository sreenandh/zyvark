import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Provider } from '../providers/entities/provider.entity';
import { SendOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private usersRepo: Repository<User>,
        @InjectRepository(Provider) private providersRepo: Repository<Provider>,
        private jwtService: JwtService,
        private notificationsService: NotificationsService,
    ) { }

    async sendOtp(dto: SendOtpDto) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // ─── ADMIN SHORTCUT ───
        if (dto.phone === process.env.ADMIN_PHONE) {
            console.log('Admin login shortcut used. OTP: 123456');
            return { message: 'OTP sent (admin)' };
        }

        // ─── LOGIN MODE: account MUST already exist ───
        if (dto.mode === 'login') {
            if (dto.role === 'provider') {
                const provider = await this.providersRepo.findOne({ where: { phone: dto.phone } });
                if (!provider) throw new BadRequestException('No account found with this phone number. Please create an account first.');
                provider.otp = otp;
                provider.otpExpiresAt = otpExpiresAt;
                await this.providersRepo.save(provider);
            } else {
                const user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
                if (!user) throw new BadRequestException('No account found with this phone number. Please create an account first.');
                user.otp = otp;
                user.otpExpiresAt = otpExpiresAt;
                await this.usersRepo.save(user);
            }
        }
        // ─── REGISTER MODE: phone & email must NOT exist ───
        else if (dto.mode === 'register') {
            if (!dto.name || !dto.name.trim()) throw new BadRequestException('Name is required for registration.');
            if (!dto.email || !dto.email.trim()) throw new BadRequestException('Email is required for registration.');

            if (dto.role === 'provider') {
                const existingByPhone = await this.providersRepo.findOne({ where: { phone: dto.phone } });
                if (existingByPhone) throw new ConflictException('This phone number is already registered. Please sign in instead.');
                const existingByEmail = await this.providersRepo.findOne({ where: { email: dto.email } });
                if (existingByEmail) throw new ConflictException('This email is already registered. Please use a different email or sign in.');
                const provider = this.providersRepo.create({ phone: dto.phone, name: dto.name.trim(), email: dto.email.trim() });
                provider.otp = otp;
                provider.otpExpiresAt = otpExpiresAt;
                await this.providersRepo.save(provider);
            } else {
                const existingByPhone = await this.usersRepo.findOne({ where: { phone: dto.phone } });
                if (existingByPhone) throw new ConflictException('This phone number is already registered. Please sign in instead.');
                const existingByEmail = await this.usersRepo.findOne({ where: { email: dto.email } });
                if (existingByEmail) throw new ConflictException('This email is already registered. Please use a different email or sign in.');
                const user = this.usersRepo.create({ phone: dto.phone, name: dto.name.trim(), email: dto.email.trim() });
                user.otp = otp;
                user.otpExpiresAt = otpExpiresAt;
                await this.usersRepo.save(user);
            }
        }

        console.log(`📱 OTP for ${dto.phone}: ${otp}`);
        return { message: 'OTP sent successfully' };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        // ─── ADMIN SHORTCUT ───
        if (dto.phone === process.env.ADMIN_PHONE) {
            if (dto.otp !== '123456') throw new UnauthorizedException('Invalid Admin OTP');
            // Check if admin exists in Users, if not create/return minimal
            // Ideally Admin should be a User with role 'admin'
            let user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
            if (!user) {
                user = this.usersRepo.create({ phone: dto.phone, name: 'Admin', role: 'admin' });
                await this.usersRepo.save(user);
            }
            const token = this.jwtService.sign({ sub: user.id, phone: user.phone, role: 'admin' });
            return {
                accessToken: token,
                user: { id: user.id, phone: user.phone, name: user.name, role: 'admin' },
                isNewUser: false,
            };
        }

        const isRegister = dto.mode === 'register';

        if (dto.role === 'provider') {
            const provider = await this.providersRepo.findOne({ where: { phone: dto.phone } });
            if (!provider) throw new BadRequestException('Provider not found');
            if (provider.otp !== dto.otp) throw new UnauthorizedException('Invalid OTP');
            if (!provider.otpExpiresAt || provider.otpExpiresAt < new Date()) throw new UnauthorizedException('OTP expired');

            provider.otp = null;
            provider.otpExpiresAt = null;
            await this.providersRepo.save(provider);

            // Send context-specific email
            if (isRegister) {
                this.notificationsService.sendWelcomeNewUser(provider.phone, provider.name || 'Provider', provider.email).catch(() => { });
            } else {
                this.notificationsService.sendWelcomeBack(provider.phone, provider.name || 'Provider', provider.email).catch(() => { });
            }

            const token = this.jwtService.sign({ sub: provider.id, phone: provider.phone, role: 'provider' });
            return {
                accessToken: token,
                user: { id: provider.id, phone: provider.phone, name: provider.name, role: 'provider' },
                isNewUser: isRegister,
            };
        } else {
            const user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
            if (!user) throw new BadRequestException('User not found');
            if (user.otp !== dto.otp) throw new UnauthorizedException('Invalid OTP');
            if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) throw new UnauthorizedException('OTP expired');

            user.otp = null;
            user.otpExpiresAt = null;
            await this.usersRepo.save(user);

            // Send context-specific email
            if (isRegister) {
                this.notificationsService.sendWelcomeNewUser(user.phone, user.name || 'User', user.email).catch(() => { });
            } else {
                this.notificationsService.sendWelcomeBack(user.phone, user.name || 'User', user.email).catch(() => { });
            }

            const token = this.jwtService.sign({ sub: user.id, phone: user.phone, role: user.role });
            return {
                accessToken: token,
                user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
                isNewUser: isRegister,
            };
        }
    }

    async getProfile(userId: string, role: string) {
        if (role === 'provider') {
            return this.providersRepo.findOne({ where: { id: userId }, relations: ['skills', 'skills.category', 'location'] });
        }
        return this.usersRepo.findOne({ where: { id: userId }, relations: ['addresses'] });
    }
}
