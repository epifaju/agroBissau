'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
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
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 md:w-8 md:h-8" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={handleSelectAll} size="sm" className="w-full sm:w-auto">
                Tout sélectionner
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  onClick={() => handleMarkAsRead(selectedIds)}
                  size="sm"
                  className="w-full sm:w-auto"
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
            <CardContent className="p-8 md:p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-sm md:text-base">Aucune notification pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-shadow touch-target ${
                  !notification.isRead ? 'border-l-4 border-l-green-600' : ''
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    handleMarkAsRead([notification.id]);
                  }
                }}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl md:text-2xl">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-sm md:text-base">{notification.title}</h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></span>
                            )}
                            <Badge className={`${getTypeColor(notification.type)} text-xs flex-shrink-0`}>
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2 text-xs md:text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(new Date(notification.createdAt))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                            className="w-5 h-5 cursor-pointer"
                          />
                          {notification.isRead && (
                            <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
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

