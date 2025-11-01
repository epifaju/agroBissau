'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatList } from '@/components/features/ChatList';
import { ChatWindow } from '@/components/features/ChatWindow';
import { Card } from '@/components/ui/card';

export default function MessagesPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    searchParams.get('userId')
  );
  const [selectedUser, setSelectedUser] = useState<{
    firstName: string;
    lastName: string;
    avatar?: string;
  } | null>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');
    if (userId) {
      setSelectedUserId(userId);
      fetchConversation(userId, listingId || undefined);
    }
  }, [searchParams]);

  const fetchConversation = async (otherUserId: string, listingId?: string) => {
    setLoadingConversation(true);
    try {
      // Try to fetch conversation (messages + user info)
      const response = await fetch(
        `/api/messages/conversation?userId=${otherUserId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.otherUser);
        setInitialMessages(data.messages || []);
      } else if (response.status === 404) {
        // No conversation yet, but fetch user info to start one
        const userResponse = await fetch(`/api/users/${otherUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setSelectedUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
          });
          setInitialMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      // Try to fetch just user info
      try {
        const userResponse = await fetch(`/api/users/${otherUserId}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setSelectedUser({
            firstName: userData.firstName,
            lastName: userData.lastName,
            avatar: userData.avatar,
          });
          setInitialMessages([]);
        }
      } catch (userError) {
        console.error('Error fetching user:', userError);
      }
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    router.push(`/dashboard/messages?userId=${userId}`);
    fetchConversation(userId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const currentUserId = (user as any).id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations list */}
          <div className="lg:col-span-1">
            <Card className="h-full overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <div className="overflow-y-auto h-[calc(100%-65px)] p-4">
                <ChatList
                  currentUserId={currentUserId}
                  onSelectConversation={handleSelectConversation}
                  selectedUserId={selectedUserId || undefined}
                />
              </div>
            </Card>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              {loadingConversation ? (
                <div className="h-full flex items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : selectedUserId && selectedUser ? (
                <ChatWindow
                  currentUserId={currentUserId}
                  otherUserId={selectedUserId}
                  otherUser={selectedUser}
                  initialMessages={initialMessages}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-lg mb-2">Sélectionnez une conversation</p>
                    <p className="text-sm">
                      Choisissez une conversation dans la liste à gauche ou utilisez le bouton "Contacter" sur un profil pour commencer à discuter.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
