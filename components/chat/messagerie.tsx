"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
});

type FormData = z.infer<typeof messageSchema>;

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export function Messagerie() {
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(messageSchema),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des messages");
        }
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        toast.error("Erreur lors de la récupération des messages");
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un message");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
      reset();
      scrollToBottom();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-2",
              message.user.id === user?.id && "flex-row-reverse",
            )}
          >
            <UserAvatar
              user={{
                name: message.user.name,
                image: message.user.image,
              }}
              className="size-8"
            />
            <div
              className={cn(
                "rounded-lg px-4 py-2",
                message.user.id === user?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              <p className="text-sm font-medium">{message.user.name}</p>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          placeholder="Tapez votre message..."
          {...register("content")}
          disabled={isLoading || !user}
        />
        <Button type="submit" disabled={isLoading || !user}>
          {isLoading ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
      {errors?.content && (
        <p className="text-xs text-red-600">{errors.content.message}</p>
      )}
    </div>
  );
}
