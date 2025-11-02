'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface Conversation {
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface ChatListProps {
  currentUserId: string;
  onSelectConversation: (userId: string) => void;
  selectedUserId?: string;
}

export function ChatList({
  currentUserId,
  onSelectConversation,
  selectedUserId,
}: ChatListProps) {
  const t = useTranslations('dashboard.messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [currentUserId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const messages = await response.json();
        
        // Group messages by conversation
        const conversationMap = new Map<string, Conversation>();

        messages.forEach((message: any) => {
          const otherUserId =
            message.senderId === currentUserId
              ? message.receiverId
              : message.senderId;

          const otherUser =
            message.senderId === currentUserId
              ? message.receiver
              : message.sender;

          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              otherUser: {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                avatar: otherUser.avatar,
              },
              lastMessage: undefined,
              unreadCount: 0,
            });
          }

          const conversation = conversationMap.get(otherUserId)!;
          
          // Update last message
          if (
            !conversation.lastMessage ||
            new Date(message.createdAt) >
              new Date(conversation.lastMessage.createdAt)
          ) {
            conversation.lastMessage = {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId,
            };
          }

          // Count unread messages
          if (
            message.receiverId === currentUserId &&
            !message.readAt
          ) {
            conversation.unreadCount++;
          }
        });

        // Sort by last message date
        const sortedConversations = Array.from(conversationMap.values()).sort(
          (a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return (
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
            );
          }
        );

        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>{t('noConversations')}</p>
        <p className="text-sm mt-2">{t('noConversationsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const isSelected = selectedUserId === conversation.otherUser.id;
        const otherUserInitials = `${conversation.otherUser.firstName[0]}${conversation.otherUser.lastName[0]}`;
        const isLastMessageFromOther =
          conversation.lastMessage?.senderId !== currentUserId;

        return (
          <Card
            key={conversation.otherUser.id}
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${
              isSelected ? 'ring-2 ring-green-600' : ''
            }`}
            onClick={() => onSelectConversation(conversation.otherUser.id)}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={conversation.otherUser.avatar} />
                  <AvatarFallback>{otherUserInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold truncate">
                      {conversation.otherUser.firstName}{' '}
                      {conversation.otherUser.lastName}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-green-600">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          isLastMessageFromOther && conversation.unreadCount > 0
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}
                      >
                        {isLastMessageFromOther && t('you')}
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

