import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CalendarView from '@/components/CalendarView';
import LogEntry from '@/components/LogEntry';
import EntriesView from '@/components/EntriesView';
import Insights from '@/components/Insights';
import AdminPanel from '@/components/AdminPanel';
import Login from '@/components/Login';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import { PeriodEntry, CycleData } from '@/types/period';
import { useToast } from '@/hooks/use-toast';
import LogViewer from '@/components/LogViewer';
import ReliefIdeas from '@/components/ReliefIdeas';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const { toast } = useToast();

  // Sample cycle data - in a real app, this could also be stored per user
  const [cycleData, setCycleData] = useState<CycleData>({
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: '2025-06-11',
    averageCycleLength: 28
  });

  const [periodEntries, setPeriodEntries] = useState<PeriodEntry[]>([]);

  useEffect(() => {
    if (user) {
      // Listen to user's period entries
      const q = query(
        collection(db, 'periodEntries'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const entries: PeriodEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            date: data.date,
            flow: data.flow,
            symptoms: data.symptoms,
            mood: data.mood,
            notes: data.notes
          });
        });
        setPeriodEntries(entries);
      });

      return unsubscribe;
    }
  }, [user]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setActiveTab('log');
  };

  const handleSaveEntry = async (entry: PeriodEntry) => {
    try {
      if (entry.isFirstDayOfCycle) {
        // Update cycle data with new start date
        const updatedCycleData = {
          ...cycleData,
          lastPeriodStart: entry.date
        };
        // Here you would typically update this in your database
        // For now, we'll just update the local state
        setCycleData(updatedCycleData);
      }

      // Save the entry
      await addDoc(collection(db, 'periodEntries'), {
        ...entry,
        userId: user?.uid
      });

      toast({
        title: "Success",
        description: "Entry saved successfully!",
      });
    } catch (error) {
      console.error('Detailed error saving entry:', error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleEntryClick = (entry: PeriodEntry) => {
    setSelectedDate(entry.date);
    setActiveTab('log');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <CalendarView
            cycleData={cycleData}
            periodEntries={periodEntries}
            onDateClick={handleDateClick}
          />
        );
      case 'log':
        return selectedDate ? (
          <LogEntry
            onSaveEntry={handleSaveEntry}
            selectedDate={selectedDate}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please select a date from the calendar to log an entry.</p>
          </div>
        );
      case 'entries':
        return (
          <EntriesView 
            entries={periodEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            onEntryClick={handleEntryClick}
          />
        );
      case 'insights':
        return (
          <Insights
            cycleData={cycleData}
            periodEntries={periodEntries}
          />
        );
      case 'relief':
        return (
          <ReliefIdeas periodEntries={periodEntries} />
        );
      case 'admin':
        return isAdmin ? <AdminPanel /> : null;
      case 'logs':
        return isAdmin ? <LogViewer /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-indigo-50/50">
      <BackgroundBlobs />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="mt-8">
          {renderActiveTab()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
