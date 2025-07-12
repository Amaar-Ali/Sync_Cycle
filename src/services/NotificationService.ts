import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  NotificationConfig, 
  NotificationDocument, 
  NotificationPreferences,
  NotificationType,
  NOTIFICATION_TEMPLATES 
} from '@/types/notifications';
import { CycleData, PeriodEntry } from '@/types/period';
import { calculateCyclePhase, getPredictedPeriods } from '@/utils/periodCalculations';

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Schedule a new notification
  async scheduleNotification(userId: string, config: NotificationConfig): Promise<string> {
    try {
      const notificationData = {
        userId,
        type: config.type,
        title: config.title,
        message: config.message,
        priority: config.priority,
        scheduledFor: Timestamp.fromDate(config.scheduledFor),
        repeatInterval: config.repeatInterval || 'none',
        repeatCount: config.repeatCount || 0,
        actions: config.actions,
        metadata: config.metadata || {},
        channels: config.channels,
        createdAt: serverTimestamp(),
        sentAt: null,
        readAt: null,
        actionedAt: null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  // Get user's notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await docRef.get();
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data?.notifications || null;
      }
      
      // Return default preferences if none exist
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  // Update user's notification preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      await updateDoc(docRef, {
        notifications: preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get upcoming notifications for a user
  async getUpcomingNotifications(userId: string): Promise<NotificationDocument[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('scheduledFor', '>=', Timestamp.fromDate(new Date())),
        orderBy('scheduledFor', 'asc')
      );

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const notifications: NotificationDocument[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            notifications.push({
              id: doc.id,
              userId: data.userId,
              type: data.type,
              title: data.title,
              message: data.message,
              priority: data.priority,
              scheduledFor: data.scheduledFor.toDate(),
              sentAt: data.sentAt?.toDate(),
              readAt: data.readAt?.toDate(),
              actionedAt: data.actionedAt?.toDate(),
              action: data.action,
              metadata: data.metadata,
              channels: data.channels,
              repeatInterval: data.repeatInterval,
              repeatCount: data.repeatCount,
              nextScheduledFor: data.nextScheduledFor?.toDate()
            });
          });
          resolve(notifications);
        }, reject);

        // Cleanup subscription after 5 seconds
        setTimeout(() => unsubscribe(), 5000);
      });
    } catch (error) {
      console.error('Error getting upcoming notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, {
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark notification as sent
  async markAsSent(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, {
        sentAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      throw error;
    }
  }

  // Handle notification action
  async handleNotificationAction(notificationId: string, action: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, {
        actionedAt: serverTimestamp(),
        action
      });
    } catch (error) {
      console.error('Error handling notification action:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Schedule period prediction notifications
  async schedulePeriodPredictions(userId: string, cycleData: CycleData): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences?.types.period_predictions) return;

      const advanceNotice = preferences.timing.period_advance_notice || 3;
      const predictedPeriods = getPredictedPeriods(cycleData, 3);

      for (const periodDate of predictedPeriods) {
        const notificationDate = new Date(periodDate);
        notificationDate.setDate(notificationDate.getDate() - advanceNotice);

        if (notificationDate > new Date()) {
          const daysUntilPeriod = Math.ceil((periodDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          const template = NOTIFICATION_TEMPLATES.period_prediction;
          const message = template.message.replace('{{daysUntilPeriod}}', daysUntilPeriod.toString());

          await this.scheduleNotification(userId, {
            id: `period_prediction_${periodDate.toISOString().split('T')[0]}`,
            type: 'period_prediction',
            title: template.title,
            message,
            priority: template.priority,
            scheduledFor: notificationDate,
            actions: template.actions.map((action, index) => ({
              ...action,
              id: `${action.action}_${index}`
            })),
            channels: template.channels,
            metadata: {
              predictedPeriodDate: periodDate.toISOString(),
              daysUntilPeriod
            }
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling period predictions:', error);
      throw error;
    }
  }

  // Schedule fertility alerts
  async scheduleFertilityAlerts(userId: string, cycleData: CycleData): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences?.types.fertility_alerts) return;

      const advanceNotice = preferences.timing.fertility_advance_notice || 2;
      const predictedPeriods = getPredictedPeriods(cycleData, 3);

      for (const periodDate of predictedPeriods) {
        const ovulationDate = new Date(periodDate);
        ovulationDate.setDate(ovulationDate.getDate() - 14); // 14 days before period

        const notificationDate = new Date(ovulationDate);
        notificationDate.setDate(notificationDate.getDate() - advanceNotice);

        if (notificationDate > new Date()) {
          const daysUntilOvulation = Math.ceil((ovulationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          const template = NOTIFICATION_TEMPLATES.fertility_alert;
          const message = template.message.replace('{{daysUntilOvulation}}', daysUntilOvulation.toString());

          await this.scheduleNotification(userId, {
            id: `fertility_alert_${ovulationDate.toISOString().split('T')[0]}`,
            type: 'fertility_alert',
            title: template.title,
            message,
            priority: template.priority,
            scheduledFor: notificationDate,
            actions: template.actions.map((action, index) => ({
              ...action,
              id: `${action.action}_${index}`
            })),
            channels: template.channels,
            metadata: {
              ovulationDate: ovulationDate.toISOString(),
              daysUntilOvulation
            }
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling fertility alerts:', error);
      throw error;
    }
  }

  // Schedule symptom reminders
  async scheduleSymptomReminders(userId: string): Promise<void> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences?.types.symptom_reminders) return;

      const frequency = preferences.timing.symptom_reminder_frequency;
      const template = NOTIFICATION_TEMPLATES.symptom_reminder;

      let repeatInterval: 'daily' | 'weekly' | 'monthly' = 'daily';
      if (frequency === 'weekly') repeatInterval = 'weekly';
      else if (frequency === 'custom') repeatInterval = 'daily'; // Default to daily for custom

      // Schedule for tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      await this.scheduleNotification(userId, {
        id: 'symptom_reminder_daily',
        type: 'symptom_reminder',
        title: template.title,
        message: template.message,
        priority: template.priority,
        scheduledFor: tomorrow,
        repeatInterval,
        repeatCount: -1, // Infinite
        actions: template.actions.map((action, index) => ({
          ...action,
          id: `${action.action}_${index}`
        })),
        channels: template.channels
      });
    } catch (error) {
      console.error('Error scheduling symptom reminders:', error);
      throw error;
    }
  }

  // Get default notification preferences
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      enabled: true,
      types: {
        period_predictions: true,
        symptom_reminders: true,
        fertility_alerts: true,
        health_checkins: false,
        medication_reminders: false,
        cycle_insights: true,
        wellness_tips: true,
        appointment_reminders: true
      },
      timing: {
        period_advance_notice: 3,
        symptom_reminder_frequency: 'daily',
        fertility_advance_notice: 2,
        health_checkin_frequency: 'weekly',
        quiet_hours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      },
      channels: {
        push: true,
        email: false,
        sms: false,
        in_app: true
      },
      snooze: {
        enabled: true,
        default_duration: 30,
        max_snoozes: 3
      }
    };
  }

  // Check if notification should be sent during quiet hours
  isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.timing.quiet_hours.enabled) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: preferences.timing.quiet_hours.timezone 
    });
    
    const start = preferences.timing.quiet_hours.start;
    const end = preferences.timing.quiet_hours.end;

    return currentTime >= start || currentTime <= end;
  }

  // Process template variables
  processTemplateVariables(template: string, variables: Record<string, any>): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
    });
    return processed;
  }
}

export const notificationService = NotificationService.getInstance();