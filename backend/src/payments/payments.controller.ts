import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('create-order')
    @ApiOperation({ summary: 'Create Razorpay payment order' })
    createOrder(@Body() body: { emergencyId: string; amount: number }) {
        return this.paymentsService.createOrder(body.emergencyId, body.amount);
    }

    @Post('verify')
    @ApiOperation({ summary: 'Verify Razorpay payment signature' })
    verify(@Body() body: { emergencyId: string; razorpayPaymentId: string; signature: string }) {
        return this.paymentsService.verifyPayment(body.emergencyId, body.razorpayPaymentId, body.signature);
    }

    @Post('refund/:emergencyId')
    @ApiOperation({ summary: 'Initiate refund' })
    refund(@Param('emergencyId') id: string) {
        return this.paymentsService.refund(id);
    }

    @Get(':emergencyId')
    @ApiOperation({ summary: 'Get payment details' })
    get(@Param('emergencyId') id: string) {
        return this.paymentsService.getByEmergencyId(id);
    }
}
