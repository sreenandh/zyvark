import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Put('profile')
    @ApiOperation({ summary: 'Update user profile' })
    updateProfile(@Request() req, @Body() data: any) {
        return this.usersService.updateProfile(req.user.sub, data);
    }

    @Post('addresses')
    @ApiOperation({ summary: 'Add a saved address' })
    addAddress(@Request() req, @Body() data: any) {
        return this.usersService.addAddress(req.user.sub, data);
    }

    @Get('addresses')
    @ApiOperation({ summary: 'List saved addresses' })
    getAddresses(@Request() req) {
        return this.usersService.getAddresses(req.user.sub);
    }

    @Delete('addresses/:id')
    @ApiOperation({ summary: 'Delete a saved address' })
    deleteAddress(@Request() req, @Param('id') id: string) {
        return this.usersService.deleteAddress(req.user.sub, id);
    }
}
