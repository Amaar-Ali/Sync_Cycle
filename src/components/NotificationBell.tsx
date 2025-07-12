import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/NotificationService';
import { NotificationDocument } from '@/types/notifications';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const upcomingNotifications = await notificationService.getUpcomingNotifications(user.uid);
      setNotifications(upcomingNotifications);
      
      // Count unread notifications (not actioned)
      const unread = upcomingNotifications.filter(n => !n.actionedAt).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleNotificationCenterClose = () => {
    setIsNotificationCenterOpen(false);
    // Reload notifications when center closes
    loadNotifications();
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={handleBellClick}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleNotificationCenterClose}
      />
    </>
  );
};

export default NotificationBell;