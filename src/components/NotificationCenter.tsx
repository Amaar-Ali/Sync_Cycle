import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/NotificationService';
import { 
  NotificationDocument, 
  NotificationPreferences,
  NotificationType 
} from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationDocument[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
      loadPreferences();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const upcomingNotifications = await notificationService.getUpcomingNotifications(user.uid);
      setNotifications(upcomingNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const prefs = await notificationService.getNotificationPreferences(user.uid);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleNotificationAction = async (notificationId: string, action: string) => {
    try {
      await notificationService.handleNotificationAction(notificationId, action);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: "Success",
        description: "Notification action completed",
      });
    } catch (error) {
      console.error('Error handling notification action:', error);
      toast({
        title: "Error",
        description: "Failed to complete action",
        variant: "destructive"
      });
    }
  };

  const handlePreferenceChange = async (type: keyof NotificationPreferences['types'], enabled: boolean) => {
    if (!user || !preferences) return;
    
    try {
      const updatedPreferences = {
        ...preferences,
        types: {
          ...preferences.types,
          [type]: enabled
        }
      };
      
      await notificationService.updateNotificationPreferences(user.uid, updatedPreferences);
      setPreferences(updatedPreferences);
      
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'period_prediction':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'fertility_alert':
        return <AlertCircle className="h-4 w-4 text-pink-500" />;
      case 'symptom_reminder':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'medication_reminder':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatScheduledTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} from now`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} from now`;
    } else {
      return 'Soon';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Notification Center</h2>
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[calc(80vh-80px)]">
          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatScheduledTime(notification.scheduledFor)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {notification.actions.map((action) => (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                onClick={() => handleNotificationAction(notification.id, action.action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5" />
              <h3 className="font-semibold">Notification Settings</h3>
            </div>

            {preferences && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Enable Notifications</span>
                  <Switch
                    checked={preferences.enabled}
                    onCheckedChange={(enabled) => 
                      notificationService.updateNotificationPreferences(user!.uid, { enabled })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Notification Types</h4>
                  
                  {Object.entries(preferences.types).map(([type, enabled]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(type as keyof NotificationPreferences['types'], checked)
                        }
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Channels</h4>
                  
                  {Object.entries(preferences.channels).map(([channel, enabled]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {channel === 'in_app' ? 'In-App' : channel}
                      </span>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => {
                          const updatedChannels = {
                            ...preferences.channels,
                            [channel]: checked
                          };
                          notificationService.updateNotificationPreferences(user!.uid, {
                            channels: updatedChannels
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;