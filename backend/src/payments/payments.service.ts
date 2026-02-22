import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    ) { }

    async createOrder(emergencyId: string, amount: number) {
        // In production, create Razorpay order:
        // const Razorpay = require('razorpay');
        // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
        // const order = await instance.orders.create({ amount: amount * 100, currency: 'INR', receipt: emergencyId });

        const mockOrderId = `order_${Date.now()}`;

        const payment = this.paymentsRepo.create({
            emergencyId,
            amount,
            escrowStatus: 'held',
            razorpayOrderId: mockOrderId,
            paidAt: new Date(),
        });

        const saved = await this.paymentsRepo.save(payment);
        return {
            payment: saved,
            razorpayOrderId: mockOrderId,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            amount: amount * 100, // in paise
            currency: 'INR',
        };
    }

    async verifyPayment(emergencyId: string, razorpayPaymentId: string, signature: string) {
        // In production, verify Razorpay signature:
        // const crypto = require('crypto');
        // const generated = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        //   .update(orderId + '|' + razorpayPaymentId).digest('hex');
        // if (generated !== signature) throw new BadRequestException('Invalid payment signature');

        const payment = await this.paymentsRepo.findOne({ where: { emergencyId } });
        if (payment) {
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.paidAt = new Date();
            await this.paymentsRepo.save(payment);
        }
        return { verified: true, payment };
    }

    async releaseEscrow(emergencyId: string) {
        const payment = await this.paymentsRepo.findOne({ where: { emergencyId } });
        if (payment) {
            payment.escrowStatus = 'released';
            payment.releasedAt = new Date();
            await this.paymentsRepo.save(payment);
        }
        return payment;
    }

    async refund(emergencyId: string) {
        const payment = await this.paymentsRepo.findOne({ where: { emergencyId } });
        if (payment) {
            // In production, call Razorpay refund API
            payment.escrowStatus = 'refunded';
            payment.refundedAt = new Date();
            await this.paymentsRepo.save(payment);
        }
        return payment;
    }

    async getByEmergencyId(emergencyId: string) {
        return this.paymentsRepo.findOne({ where: { emergencyId } });
    }
}
