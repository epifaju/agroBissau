'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  isRead?: boolean;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  otherUser: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  initialMessages?: Message[];
}

export function ChatWindow({
  currentUserId,
  otherUserId,
  otherUser,
  initialMessages = [],
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { socket, isConnected } = useSocket(currentUserId);

  useEffect(() => {
    if (!socket) return;

    // Join conversation room
    socket.emit('join-conversation', { userId: currentUserId, otherUserId });

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
      
      // Mark as read if user is viewing
      if (message.receiverId === currentUserId) {
        socket.emit('mark-read', { userId: currentUserId, otherUserId });
      }
    };

    // Listen for message-received event
    const handleMessageReceived = (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      scrollToBottom();
    };

    // Listen for typing indicators
    const handleTyping = (data: { senderId: string; isTyping: boolean }) => {
      if (data.senderId === otherUserId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-received', handleMessageReceived);
    socket.on('user-typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-received', handleMessageReceived);
      socket.off('user-typing', handleTyping);
    };
  }, [socket, currentUserId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (value: string) => {
    setInput(value);

    if (socket && value.length > 0) {
      // Emit typing indicator
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId: otherUserId,
        isTyping: true,
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (socket) {
          socket.emit('typing', {
            senderId: currentUserId,
            receiverId: otherUserId,
            isTyping: false,
          });
        }
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !socket || sending) return;

    setSending(true);
    const content = input.trim();
    setInput('');

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket) {
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId: otherUserId,
        isTyping: false,
      });
    }

    try {
      socket.emit('send-message', {
        senderId: currentUserId,
        receiverId: otherUserId,
        content,
      });

      // Wait for confirmation
      socket.once('message-sent', () => {
        setSending(false);
      });

      socket.once('message-error', (error: { error: string }) => {
        console.error('Error sending message:', error);
        setSending(false);
        // Optionally show error to user
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUserInitials = `${otherUser.firstName[0]}${otherUser.lastName[0]}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 bg-white">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser.avatar} />
            <AvatarFallback>{otherUserInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold">
              {otherUser.firstName} {otherUser.lastName}
            </p>
            {isConnected ? (
              <p className="text-xs text-green-600">En ligne</p>
            ) : (
              <p className="text-xs text-gray-400">Hors ligne</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun message. Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            const senderInitials = isOwn
              ? `${message.sender.firstName[0]}${message.sender.lastName[0]}`
              : `${message.receiver.firstName[0]}${message.receiver.lastName[0]}`;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={isOwn ? message.sender.avatar : message.receiver.avatar}
                  />
                  <AvatarFallback>{senderInitials}</AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {otherUserTyping && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback>{otherUserInitials}</AvatarFallback>
            </Avatar>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={!isConnected || sending}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !isConnected || sending}
            size="icon"
            className="flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

