import { IsString, IsNotEmpty, Length, IsOptional, IsEmail, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
    @ApiProperty({ example: '9876543210', description: 'Phone number without country code' })
    @IsString()
    @IsNotEmpty()
    @Length(10, 15)
    phone: string;

    @ApiProperty({ example: 'user', description: 'Role: user or provider', required: false })
    @IsString()
    role?: string = 'user';

    @ApiProperty({ example: 'login', description: 'Mode: login (existing account) or register (new account)' })
    @IsString()
    @IsIn(['login', 'register'])
    mode: string = 'login';

    @ApiProperty({ example: 'John Doe', description: 'Full name (required for register)', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'john@example.com', description: 'Email (required for register)', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '9876543210' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 6)
    otp: string;

    @ApiProperty({ example: 'user' })
    @IsString()
    role?: string = 'user';

    @ApiProperty({ example: 'login', description: 'Mode: login or register', required: false })
    @IsOptional()
    @IsString()
    @IsIn(['login', 'register'])
    mode?: string = 'login';
}
