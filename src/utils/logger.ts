import { collection, addDoc, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { LogEntry } from '@/types/period';

export const addLog = async (logEntry: Omit<LogEntry, 'id' | 'timestamp'>) => {
  try {
    const logData = {
      ...logEntry,
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'logs'), logData);
    return { id: docRef.id, ...logData };
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

export const getLogs = async (userId: string, limit: number = 100) => {
  try {
    const q = query(
      collection(db, 'logs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit
    );

    const querySnapshot = await getDocs(q);
    const logs: LogEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        userId: data.userId,
        timestamp: data.timestamp.toDate(),
        level: data.level,
        message: data.message,
        details: data.details,
        component: data.component
      });
    });

    return logs;
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
};

// Helper functions for different log levels
export const logInfo = (userId: string, message: string, details?: any, component?: string) => {
  return addLog({ userId, level: 'info', message, details, component });
};

export const logWarning = (userId: string, message: string, details?: any, component?: string) => {
  return addLog({ userId, level: 'warning', message, details, component });
};

export const logError = (userId: string, message: string, details?: any, component?: string) => {
  return addLog({ userId, level: 'error', message, details, component });
}; 