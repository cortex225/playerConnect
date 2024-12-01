// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { content, receiverId } = body;

        if (!content || !receiverId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const message = {
            id: Date.now().toString(),
            content,
            sender: session.user.id,
            receiver: receiverId,
            timestamp: new Date().toISOString(),
            isRead: false,
        };

        // Trigger pour le canal privé du destinataire
        await pusherServer.trigger(
            `private-messages-${receiverId}`,
            'new-message',
            message
        );

        return NextResponse.json(message);
    } catch (error) {
        console.error('MESSAGE_POST', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}