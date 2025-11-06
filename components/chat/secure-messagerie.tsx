"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Shield, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";
import Pusher from "pusher-js";

import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Contact {
  id: string;
  name: string | null;
  image: string | null;
  approved?: boolean;
  approvedAt?: Date;
  lastMessageDate?: Date;
  unreadCount?: number;
  athletes?: any;
  recruiters?: any;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  createdAt: Date;
  isRead: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function SecureMessagerie() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);

  // Fonction pour charger les contacts
  const loadContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      if (!response.ok) throw new Error("Erreur lors du chargement des contacts");

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de charger les contacts");
    }
  };

  // Charger les contacts au montage
  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  // Auto-sélectionner le contact depuis l'URL
  useEffect(() => {
    if (contacts.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const contactIdToOpen = params.get("openContact");

    if (contactIdToOpen) {
      const contact = contacts.find((c) => c.id === contactIdToOpen);
      if (contact) {
        setSelectedContact(contact);
        // Nettoyer l'URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [contacts]);

  // Initialiser Pusher pour les notifications en temps réel
  useEffect(() => {
    if (!user) return;

    // Initialiser Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    pusherRef.current = pusher;

    // S'abonner au canal privé de l'utilisateur
    const channel = pusher.subscribe(`private-user-${user.id}`);

    // Écouter les nouveaux messages
    channel.bind("new-message", (data: any) => {
      // Si le message est de la conversation actuelle, l'ajouter
      if (selectedContact && data.senderId === selectedContact.id) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      }

      // Mettre à jour le compteur non lu dans la liste des contacts
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === data.senderId
            ? {
                ...contact,
                unreadCount: (contact.unreadCount || 0) + 1,
                lastMessageDate: new Date(data.createdAt),
              }
            : contact
        )
      );

      // Notification toast si pas sur la conversation
      if (!selectedContact || selectedContact.id !== data.senderId) {
        toast.info(`Nouveau message de ${data.sender.name}`, {
          action: {
            label: "Voir",
            onClick: () => {
              const contact = contacts.find((c) => c.id === data.senderId);
              if (contact) setSelectedContact(contact);
            },
          },
        });
      }
    });

    // Écouter les notifications générales
    channel.bind("notification", (data: any) => {
      if (data.type === "new-message") {
        // Recharger la liste des contacts pour mettre à jour
        loadContacts();
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user, selectedContact]);

  // Charger les messages quand un contact est sélectionné
  useEffect(() => {
    if (!selectedContact) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/messages?recipientId=${selectedContact.id}`
        );

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 403) {
            toast.error(error.error || "Vous ne pouvez pas communiquer avec ce contact");
            setSelectedContact(null);
            return;
          }
          throw new Error("Erreur lors du chargement des messages");
        }

        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger les messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedContact]);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: selectedContact.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.blocked) {
          toast.error(error.error, {
            duration: 10000,
            icon: <Shield className="size-4 text-red-500" />,
          });
        } else {
          throw new Error("Erreur lors de l'envoi du message");
        }
        return;
      }

      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      toast.success("Message envoyé");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'envoyer le message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid h-[calc(100vh-12rem)] gap-4 md:grid-cols-[300px,1fr]">
      {/* Liste des contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-2 p-4">
              {contacts.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Aucun contact disponible
                </p>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                      selectedContact?.id === contact.id && "bg-accent"
                    )}
                  >
                    <Avatar className="size-10">
                      <AvatarImage src={contact.image || ""} />
                      <AvatarFallback>
                        {contact.name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-medium">{contact.name}</p>
                        {contact.unreadCount && contact.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2 size-5 p-0 text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {contact.athletes && (
                        <p className="truncate text-xs text-muted-foreground">
                          {contact.athletes.city || "Ville non spécifiée"}
                        </p>
                      )}
                      {contact.recruiters && (
                        <p className="truncate text-xs text-muted-foreground">
                          {contact.recruiters.organization || "Organisation"}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Zone de conversation */}
      <Card>
        {selectedContact ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={selectedContact.image || ""} />
                  <AvatarFallback>
                    {selectedContact.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                  {selectedContact.approved && (
                    <p className="text-xs text-muted-foreground">
                      Contact approuvé
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col p-0">
              {/* Alertes de sécurité */}
              <div className="space-y-2 p-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="size-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-900">
                    <strong>Protection active :</strong> Vos messages sont surveillés
                    automatiquement. Ne partagez jamais d'informations personnelles
                    (adresse, téléphone, réseaux sociaux).
                  </AlertDescription>
                </Alert>

                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="size-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-900">
                    <strong>Avertissement :</strong> Les messages contenant des propos
                    haineux, insultants, menaçants ou désobligeants sont strictement
                    interdits et peuvent entraîner la suspension ou le bannissement
                    définitif de votre compte.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Chargement...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">
                    Aucun message. Commencez la conversation !
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-start gap-3",
                          message.senderId === user?.id && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="size-8">
                          <AvatarImage src={message.sender.image || ""} />
                          <AvatarFallback>
                            {message.sender.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-[70%] rounded-lg px-4 py-2",
                            message.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="mt-1 text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Zone d'envoi */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Tapez votre message... (Enter pour envoyer)"
                    className="min-h-[60px] resize-none"
                    disabled={isSending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || isSending}
                    size="icon"
                    className="size-[60px]"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Shift + Enter pour nouvelle ligne
                </p>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <Users className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-lg font-medium">Sélectionnez un contact</p>
              <p className="text-sm text-muted-foreground">
                Choisissez un contact dans la liste pour commencer une conversation
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
