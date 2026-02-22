import {
    WebSocketGateway, WebSocketServer, SubscribeMessage,
    OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, string>(); // userId -> socketId

    handleConnection(client: Socket) {
        console.log(`🔌 Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`🔌 Client disconnected: ${client.id}`);
        // Remove from connected users
        for (const [userId, socketId] of this.connectedUsers) {
            if (socketId === client.id) {
                this.connectedUsers.delete(userId);
                break;
            }
        }
    }

    @SubscribeMessage('register')
    handleRegister(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
        this.connectedUsers.set(data.userId, client.id);
        console.log(`📝 User ${data.userId} registered with socket ${client.id}`);
        return { event: 'registered', data: { success: true } };
    }

    @SubscribeMessage('provider:location-update')
    handleLocationUpdate(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
        // Broadcast to the user who has an active emergency with this provider
        if (data.emergencyId) {
            this.server.emit(`emergency:${data.emergencyId}:location`, {
                latitude: data.latitude,
                longitude: data.longitude,
                timestamp: new Date(),
            });
        }
        return { event: 'location-updated', data: { success: true } };
    }

    @SubscribeMessage('emergency:status-change')
    handleStatusChange(@MessageBody() data: any) {
        this.server.emit(`emergency:${data.emergencyId}:status`, {
            status: data.status,
            timestamp: new Date(),
        });
    }

    // Emit to specific user
    emitToUser(userId: string, event: string, data: any) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }

    // Broadcast new emergency to all connected providers
    broadcastEmergency(emergencyData: any) {
        this.server.emit('emergency:new-request', emergencyData);
    }

    @SubscribeMessage('chat:message')
    handleChatMessage(@MessageBody() data: { emergencyId: string; senderId: string; message: string }) {
        this.server.emit(`emergency:${data.emergencyId}:chat`, {
            senderId: data.senderId,
            message: data.message,
            timestamp: new Date(),
        });
    }
}
