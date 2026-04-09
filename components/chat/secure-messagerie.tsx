"use client";

import { useEffect, useState, useRef } from "react";
import {
  Send,
  Shield,
  Users,
  ChevronDown,
  ChevronLeft,
  MessageCircle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import Pusher from "pusher-js";

import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Contact {
  id: string;
  name: string | null;
  image: string | null;
  approved?: boolean;
  approvedAt?: Date;
  lastMessageDate?: Date;
  unreadCount?: number;
  athletes?: {
    city?: string | null;
    country?: string | null;
    sport?: { name: string } | null;
    age?: number | null;
  } | null;
  recruiters?: {
    organization?: string | null;
    position?: string | null;
  } | null;
  fromInvitation?: boolean;
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

function getContactRole(contact: Contact): string {
  if (contact.athletes) {
    const sport = contact.athletes.sport?.name;
    return sport ? `Athlete · ${sport}` : "Athlete";
  }
  if (contact.recruiters) {
    const org = contact.recruiters.organization;
    return org ? `Recruteur · ${org}` : "Recruteur";
  }
  return "";
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now.getTime() - msgDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return msgDate.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) {
    return msgDate.toLocaleDateString("fr-FR", { weekday: "short" });
  }
  return msgDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function SecureMessagerie() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = contacts.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

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

  // Auto-selectionner le contact depuis l'URL
  useEffect(() => {
    if (contacts.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const contactIdToOpen = params.get("openContact");

    if (contactIdToOpen) {
      const contact = contacts.find((c) => c.id === contactIdToOpen);
      if (contact) {
        setSelectedContact(contact);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [contacts]);

  // Initialiser Pusher pour les notifications en temps reel
  useEffect(() => {
    if (!user) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe(`private-user-${user.id}`);

    channel.bind("new-message", (data: any) => {
      if (selectedContact && data.senderId === selectedContact.id) {
        setMessages((prev) => [...prev, data]);
        scrollToBottom();
      }

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

    channel.bind("notification", (data: any) => {
      if (data.type === "new-message") {
        loadContacts();
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user, selectedContact]);

  // Charger les messages quand un contact est selectionne
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
      toast.success("Message envoye");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible d'envoyer le message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contact.id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  // --- Render helpers ---

  const renderContactList = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-r from-primary/10 to-purple-600/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-purple-600">
            <Shield className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text font-urban text-xl font-bold text-transparent">
              Messages
            </h2>
          </div>
          {totalUnread > 0 && (
            <Badge className="border-0 bg-gradient-to-r from-primary to-purple-600 text-white">
              {totalUnread}
            </Badge>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un contact..."
            className="rounded-xl border-0 bg-muted/50 pl-10"
          />
        </div>
      </div>

      {/* Contact list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 p-4">
                <Users className="size-8 text-primary" />
              </div>
              <h3 className="mt-3 font-urban text-lg font-semibold">
                Aucun contact
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Les contacts apparaitront ici lorsqu&apos;un recruteur aura une
                invitation acceptee a l&apos;un de vos matchs.
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-accent",
                  selectedContact?.id === contact.id &&
                    "bg-gradient-to-r from-primary/5 to-purple-600/5"
                )}
              >
                <div className="relative">
                  <Avatar className="size-12">
                    <AvatarImage src={contact.image || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-primary/20 to-purple-600/20 font-semibold">
                      {contact.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {contact.approved && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-green-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{contact.name}</p>
                    {contact.lastMessageDate && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatMessageTime(contact.lastMessageDate)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {getContactRole(contact)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground/70">
                      {contact.fromInvitation
                        ? "Nouvelle conversation"
                        : contact.lastMessageDate
                          ? ""
                          : "Aucun message"}
                    </p>
                    {contact.unreadCount && contact.unreadCount > 0 ? (
                      <Badge className="size-5 shrink-0 justify-center rounded-full border-0 bg-gradient-to-r from-primary to-purple-600 p-0 text-[10px] text-white">
                        {contact.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  const renderConversation = () => {
    if (!selectedContact) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 p-6">
            <MessageCircle className="size-12 text-primary" />
          </div>
          <h3 className="mt-4 font-urban text-xl font-bold">Vos messages</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Selectionnez un contact pour demarrer une conversation securisee
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        {/* Conversation header */}
        <div className="shrink-0 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center gap-3 p-3">
            <button
              onClick={handleBack}
              className="flex size-9 items-center justify-center rounded-full hover:bg-accent md:hidden"
            >
              <ChevronLeft className="size-5" />
            </button>
            <Avatar className="size-10">
              <AvatarImage src={selectedContact.image || ""} />
              <AvatarFallback className="bg-gradient-to-r from-primary/20 to-purple-600/20 font-semibold">
                {selectedContact.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{selectedContact.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {getContactRole(selectedContact)}
              </p>
            </div>
          </div>
        </div>

        {/* Security notice */}
        <div className="mx-4 mt-2">
          <button
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            className="flex w-full items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 text-sm"
          >
            <Shield className="size-4 text-primary" />
            <span className="font-medium text-primary">Protection active</span>
            <ChevronDown
              className={cn(
                "ml-auto size-4 transition-transform",
                showSecurityInfo && "rotate-180"
              )}
            />
          </button>
          {showSecurityInfo && (
            <div className="mt-2 space-y-2 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              <p>
                Vos messages sont moderes automatiquement pour votre securite.
              </p>
              <p>
                Ne partagez jamais d&apos;informations personnelles (adresse,
                telephone, reseaux sociaux).
              </p>
              <p>
                Les propos haineux ou menacants entrainent le bannissement du
                compte.
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-2">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 p-4">
                <MessageCircle className="size-8 text-primary" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Aucun message. Commencez la conversation !
              </p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {messages.map((message, index) => {
                const isSent = message.senderId === user?.id;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const isGrouped =
                  prevMessage?.senderId === message.senderId;

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      isSent && "flex-row-reverse",
                      !isGrouped && "mt-3"
                    )}
                  >
                    {/* Avatar for received messages */}
                    {!isSent ? (
                      isGrouped ? (
                        <div className="size-8 shrink-0" />
                      ) : (
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={message.sender.image || ""} />
                          <AvatarFallback className="bg-gradient-to-r from-primary/20 to-purple-600/20 text-xs font-semibold">
                            {message.sender.name?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )
                    ) : null}

                    <div
                      className={cn(
                        "max-w-[75%] px-4 py-2",
                        isSent
                          ? "rounded-2xl rounded-br-md bg-gradient-to-r from-primary to-purple-600 text-white"
                          : "rounded-2xl rounded-bl-md bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          isSent ? "text-white/70" : "text-muted-foreground/70"
                        )}
                      >
                        {new Date(message.createdAt).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="shrink-0 border-t bg-background/95 p-3 backdrop-blur">
          <div className="flex items-end gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Votre message..."
              className="max-h-[120px] min-h-[44px] resize-none rounded-2xl border-0 bg-muted/50"
              rows={1}
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="size-11 shrink-0 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile layout */}
      <div className="flex h-[calc(100vh-8rem)] flex-col md:hidden">
        {selectedContact ? (
          renderConversation()
        ) : (
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-background">
            {renderContactList()}
          </div>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden h-[calc(100vh-8rem)] gap-4 md:flex">
        <div className="w-[320px] shrink-0 overflow-hidden rounded-2xl border bg-background">
          {renderContactList()}
        </div>
        <div className="flex-1 overflow-hidden rounded-2xl border bg-background">
          {renderConversation()}
        </div>
      </div>
    </>
  );
}
