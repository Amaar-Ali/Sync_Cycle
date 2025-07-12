export type NotificationType = 
  | 'period_prediction'
  | 'symptom_reminder'
  | 'fertility_alert'
  | 'health_checkin'
  | 'medication_reminder'
  | 'cycle_insight'
  | 'wellness_tip'
  | 'appointment_reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';
export type RepeatInterval = 'daily' | 'weekly' | 'monthly' | 'custom' | 'none';

export interface NotificationAction {
  id: string;
  label: string;
  action: 'dismiss' | 'snooze' | 'log_entry' | 'log_symptoms' | 'track_ovulation' | 'complete_checkin' | 'custom';
  url?: string;
  data?: Record<string, any>;
}

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  scheduledFor: Date;
  repeatInterval?: RepeatInterval;
  repeatCount?: number; // -1 for infinite
  actions: NotificationAction[];
  metadata?: Record<string, any>;
  channels: NotificationChannel[];
}

export interface NotificationDocument {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  actionedAt?: Date;
  action?: string;
  metadata?: Record<string, any>;
  channels: NotificationChannel[];
  repeatInterval?: RepeatInterval;
  repeatCount?: number;
  nextScheduledFor?: Date;
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  types: {
    period_predictions: boolean;
    symptom_reminders: boolean;
    fertility_alerts: boolean;
    health_checkins: boolean;
    medication_reminders: boolean;
    cycle_insights: boolean;
    wellness_tips: boolean;
    appointment_reminders: boolean;
  };
  timing: {
    period_advance_notice: number; // days before period
    symptom_reminder_frequency: 'daily' | 'weekly' | 'custom';
    fertility_advance_notice: number; // days before ovulation
    health_checkin_frequency: 'daily' | 'weekly' | 'monthly';
    quiet_hours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
      timezone: string;
    };
  };
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };
  snooze: {
    enabled: boolean;
    default_duration: number; // minutes
    max_snoozes: number;
  };
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actions: Omit<NotificationAction, 'id'>[];
  priority: NotificationPriority;
  channels: NotificationChannel[];
  variables: string[]; // Template variables like {{userName}}, {{daysUntilPeriod}}
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  period_prediction: {
    id: 'period_prediction',
    type: 'period_prediction',
    title: 'Period Prediction',
    message: 'Your period is predicted to start in {{daysUntilPeriod}} days. Consider logging any early symptoms.',
    actions: [
      { label: 'Log Entry', action: 'log_entry' },
      { label: 'Snooze', action: 'snooze' },
      { label: 'Dismiss', action: 'dismiss' }
    ],
    priority: 'medium',
    channels: ['push', 'in_app'],
    variables: ['daysUntilPeriod']
  },
  symptom_reminder: {
    id: 'symptom_reminder',
    type: 'symptom_reminder',
    title: 'Symptom Check-in',
    message: 'How are you feeling today? Log your symptoms to track patterns.',
    actions: [
      { label: 'Log Symptoms', action: 'log_symptoms' },
      { label: 'Skip Today', action: 'dismiss' },
      { label: 'Remind Later', action: 'snooze' }
    ],
    priority: 'low',
    channels: ['push', 'in_app'],
    variables: []
  },
  fertility_alert: {
    id: 'fertility_alert',
    type: 'fertility_alert',
    title: 'Fertility Window',
    message: 'Your fertile window is approaching. Track ovulation signs for better predictions.',
    actions: [
      { label: 'Track Ovulation', action: 'track_ovulation' },
      { label: 'Dismiss', action: 'dismiss' },
      { label: 'Remind Later', action: 'snooze' }
    ],
    priority: 'high',
    channels: ['push', 'in_app'],
    variables: ['daysUntilOvulation']
  },
  health_checkin: {
    id: 'health_checkin',
    type: 'health_checkin',
    title: 'Health Check-in',
    message: 'Take a moment to check in on your overall wellness.',
    actions: [
      { label: 'Complete Check-in', action: 'complete_checkin' },
      { label: 'Skip', action: 'dismiss' },
      { label: 'Remind Later', action: 'snooze' }
    ],
    priority: 'low',
    channels: ['push', 'in_app'],
    variables: []
  },
  medication_reminder: {
    id: 'medication_reminder',
    type: 'medication_reminder',
    title: 'Medication Reminder',
    message: 'Time to take {{medicationName}}. Don\'t forget to log any side effects.',
    actions: [
      { label: 'Taken', action: 'log_entry' },
      { label: 'Skip', action: 'dismiss' },
      { label: 'Remind Later', action: 'snooze' }
    ],
    priority: 'high',
    channels: ['push', 'in_app'],
    variables: ['medicationName']
  },
  cycle_insight: {
    id: 'cycle_insight',
    type: 'cycle_insight',
    title: 'Cycle Insight',
    message: '{{insightMessage}}',
    actions: [
      { label: 'View Details', action: 'custom', url: '/insights' },
      { label: 'Dismiss', action: 'dismiss' }
    ],
    priority: 'low',
    channels: ['in_app'],
    variables: ['insightMessage']
  },
  wellness_tip: {
    id: 'wellness_tip',
    type: 'wellness_tip',
    title: 'Wellness Tip',
    message: '{{tipMessage}}',
    actions: [
      { label: 'Save Tip', action: 'custom' },
      { label: 'Dismiss', action: 'dismiss' }
    ],
    priority: 'low',
    channels: ['in_app'],
    variables: ['tipMessage']
  },
  appointment_reminder: {
    id: 'appointment_reminder',
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'You have a {{appointmentType}} appointment in {{timeUntilAppointment}}.',
    actions: [
      { label: 'View Details', action: 'custom' },
      { label: 'Dismiss', action: 'dismiss' },
      { label: 'Reschedule', action: 'custom' }
    ],
    priority: 'high',
    channels: ['push', 'email', 'in_app'],
    variables: ['appointmentType', 'timeUntilAppointment']
  }
};