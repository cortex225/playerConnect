'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { pusherClient } from '@/lib/pusher';
import { useUserConnection } from '@/hooks/use-user-connection';
import { sendMessage } from '@/hooks/use-send-messages';
import { useSession } from 'next-auth/react';

interface User {
    id: string;
    name: string;
    image: string;
    role: string;
}

interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isRead: boolean;
}

export function MessagingInterface() {
    const { data: session, status } = useSession();
    const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const { connectUser } = useUserConnection();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user) {
            setError('Vous devez être connecté pour accéder à la messagerie');
            setIsLoading(false);
            return;
        }

        // Connecter l'utilisateur authentifié
        connectUser({
            id: session.user.id,
            name: session.user.name || 'Utilisateur',
            image: session.user.image || '',
            role: session.user.role || 'USER',
        });

        // Configuration de Pusher
        pusherClient.connection.bind('connected', () => {
            setConnectionStatus('connected');
            setIsLoading(false);
        });

        pusherClient.connection.bind('error', (err: any) => {
            console.error('Erreur de connexion Pusher:', err);
            setConnectionStatus('error');
            setError('Erreur de connexion au service de messagerie');
            setIsLoading(false);
        });

        // Abonnement aux canaux avec l'ID de l'utilisateur
        const messageChannel = pusherClient.subscribe(`private-messages-${session.user.id}`);
        const userChannel = pusherClient.subscribe('connected-users');

        messageChannel.bind('new-message', (newMessage: Message) => {
            if (selectedUser && newMessage.sender === selectedUser.id) {
                setMessages((prev) => [...prev, newMessage]);
            }
        });

        userChannel.bind('update', (user: User) => {
            if (user.id !== session.user.id) {  // Ne pas s'ajouter soi-même à la liste
                setConnectedUsers((prev) => {
                    const exists = prev.some((u) => u.id === user.id);
                    if (!exists) {
                        return [...prev, user];
                    }
                    return prev;
                });
            }
        });

        return () => {
            pusherClient.unsubscribe(`private-messages-${session.user.id}`);
            pusherClient.unsubscribe('connected-users');
            pusherClient.connection.unbind_all();
        };
    }, [session, status, selectedUser]);

    const handleSendMessage = async () => {
        if (!session?.user) return;

        if (newMessage.trim() && selectedUser) {
            try {
                const message = await sendMessage({
                    content: newMessage,
                    receiverId: selectedUser.id,
                    senderId: session.user.id,
                    senderRole: session.user.role
                });

                setMessages((prev) => [...prev, message]);
                setNewMessage('');
                setIsTyping(false);
            } catch (error) {
                setError('Erreur lors de l\'envoi du message');
                console.error('Erreur d\'envoi:', error);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        setIsTyping(!!e.target.value.trim());
    };

    const handleUserSelect = async (user: User) => {
        if (!session?.user) return;

        setSelectedUser(user);
        setMessages([]);
        setError(null);

        try {
            const response = await fetch(`/api/messages/conversation?userId=${user.id}`);
            if (!response.ok) throw new Error('Erreur lors du chargement des messages');
            const historicMessages = await response.json();
            setMessages(historicMessages);
        } catch (error) {
            console.error('Erreur de chargement des messages:', error);
            setError('Impossible de charger l\'historique des messages');
        }
    };

    if (status === 'loading') {
        return <div>Chargement...</div>;
    }

    if (!session) {
        return <div>Vous devez être connecté pour accéder à la messagerie.</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex h-[600px]">
                    {/* Liste des utilisateurs connectés */}
                    <div className="w-1/3 border-r">
                        <ScrollArea className="h-[550px]">
                            {isLoading ? (
                                <p className="p-4 text-sm text-gray-500">Chargement...</p>
                            ) : error ? (
                                <p className="p-4 text-sm text-red-500">{error}</p>
                            ) : connectedUsers.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500">Aucun utilisateur connecté.</p>
                            ) : (
                                connectedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex items-center space-x-4 p-4 cursor-pointer hover:bg-muted ${
                                            selectedUser?.id === user.id ? 'bg-muted' : ''
                                        }`}
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <Avatar>
                                            <AvatarImage src={user.image || ''} alt={user.name || 'Utilisateur'} />
                                            <AvatarFallback>
                                                {user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.role}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </div>

                    {/* Zone de chat */}
                    <div className="w-2/3 flex flex-col">
                        {connectionStatus === 'error' ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-red-500">Erreur de connexion au service de messagerie</p>
                            </div>
                        ) : selectedUser ? (
                            <>
                                <div className="p-4 border-b">
                                    <div className="flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                                            <AvatarFallback>
                                                {selectedUser.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{selectedUser.name}</p>
                                            <p className="text-sm text-gray-500">{selectedUser.role}</p>
                                        </div>
                                    </div>
                                </div>

                                <ScrollArea className="flex-grow p-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`mb-4 ${
                                                message.sender === session?.user.id ? 'text-right' : 'text-left'
                                            }`}
                                        >
                                            <div
                                                className={`inline-block p-2 rounded-lg ${
                                                    message.sender === session?.user.id
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                                {message.isRead && '✓'}
                                            </p>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <p className="text-xs text-gray-500">L'utilisateur est en train d'écrire...</p>
                                    )}
                                </ScrollArea>

                                <div className="p-4 border-t">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }}
                                        className="flex space-x-2"
                                    >
                                        <Input
                                            type="text"
                                            placeholder="Écrivez un message..."
                                            value={newMessage}
                                            onChange={handleInputChange}
                                            className="flex-grow"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!selectedUser || !newMessage.trim()}
                                        >
                                            <Send className="h-4 w-4" />
                                            <span className="sr-only">Envoyer un message</span>
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>Sélectionnez un utilisateur pour démarrer une conversation.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
