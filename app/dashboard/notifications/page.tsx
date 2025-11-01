'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleMarkAsRead = async (ids: string[]) => {
    await markAsRead(ids);
    setSelectedIds([]);
  };

  const handleSelectAll = () => {
    const unreadIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.id);
    setSelectedIds(unreadIds);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return '💬';
      case 'LISTING':
        return '📢';
      case 'REVIEW':
        return '⭐';
      case 'PAYMENT':
        return '💳';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return 'bg-blue-100 text-blue-800';
      case 'LISTING':
        return 'bg-orange-100 text-orange-800';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT':
        return 'bg-green-100 text-green-800';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="w-8 h-8" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSelectAll} size="sm">
                Tout sélectionner
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  onClick={() => handleMarkAsRead(selectedIds)}
                  size="sm"
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Marquer comme lues ({selectedIds.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>Aucune notification pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-l-green-600' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead([notification.id]);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{notification.title}</h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            )}
                            <Badge className={getTypeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(new Date(notification.createdAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(notification.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, notification.id]);
                              } else {
                                setSelectedIds(selectedIds.filter((id) => id !== notification.id));
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5"
                          />
                          {notification.isRead && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

