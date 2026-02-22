import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EmergenciesService } from '../emergencies/emergencies.service';
import { ProvidersService } from '../providers/providers.service';
import { UsersService } from '../users/users.service';
import { DisputesService } from '../disputes/disputes.service';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
    constructor(
        private emergenciesService: EmergenciesService,
        private providersService: ProvidersService,
        private usersService: UsersService,
        private disputesService: DisputesService,
        private paymentsService: PaymentsService,
    ) { }

    @Get('dashboard-stats')
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    getDashboardStats() {
        return this.emergenciesService.getDashboardStats();
    }

    @Get('providers/pending')
    @ApiOperation({ summary: 'Get pending provider verification queue' })
    getPendingProviders(@Query('page') page = 1) {
        return this.providersService.findAllPending(+page);
    }

    @Get('providers')
    @ApiOperation({ summary: 'Get all providers' })
    getAllProviders(@Query('page') page = 1) {
        return this.providersService.findAll(+page);
    }

    @Put('providers/:id/approve')
    @ApiOperation({ summary: 'Approve provider' })
    approveProvider(@Param('id') id: string) {
        return this.providersService.approve(id);
    }

    @Put('providers/:id/reject')
    @ApiOperation({ summary: 'Reject provider' })
    rejectProvider(@Param('id') id: string) {
        return this.providersService.reject(id);
    }

    @Get('users')
    @ApiOperation({ summary: 'Get all users' })
    getAllUsers(@Query('page') page = 1) {
        return this.usersService.findAll(+page);
    }

    @Get('disputes')
    @ApiOperation({ summary: 'Get all disputes' })
    getDisputes(@Query('page') page = 1) {
        return this.disputesService.findAll(+page);
    }

    @Put('disputes/:id/resolve')
    @ApiOperation({ summary: 'Resolve a dispute' })
    resolveDispute(@Param('id') id: string, @Body() body: { status: string; adminNotes?: string }) {
        return this.disputesService.resolve(id, body.status, body.adminNotes);
    }

    @Get('emergencies')
    @ApiOperation({ summary: 'Get all emergencies/bookings' })
    getAllEmergencies(@Query('page') page = 1) {
        return this.emergenciesService.findAllAdmin(+page);
    }
}
