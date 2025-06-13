import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { PeriodEntry } from '@/types/period';
import { Calendar, User, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface UserLog extends PeriodEntry {
  userId: string;
  userName: string;
  userEmail: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  lastLogin?: string;
  totalLogs?: number;
  lastLogDate?: string;
  lastSymptoms?: string[];
  lastMood?: string;
}

const isUserOnline = (lastLogin?: string) => {
  if (!lastLogin) return false;
  const last = new Date(lastLogin).getTime();
  const now = Date.now();
  // Consider online if last login within 5 minutes (300,000 ms)
  return now - last < 5 * 60 * 1000;
};

const AdminPanel = () => {
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'periodEntries'), orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const logs: UserLog[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data() as PeriodEntry & { userId: string };
        
        // Get user info
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        const userData = userDoc.data();
        
        logs.push({
          ...data,
          userId: data.userId,
          userName: userData?.name || 'Unknown',
          userEmail: userData?.email || 'Unknown'
        });
      }
      
      setUserLogs(logs);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUsersAndLogs = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList: User[] = [];
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const userId = docSnap.id;
        // Fetch period entries for this user
        const q = query(collection(db, 'periodEntries'), where('userId', '==', userId));
        const entrySnapshot = await getDocs(q);
        const entries: PeriodEntry[] = [];
        entrySnapshot.forEach((entryDoc) => {
          const entryData = entryDoc.data();
          entries.push({
            id: entryDoc.id,
            userId: entryData.userId,
            date: entryData.date,
            flow: entryData.flow,
            symptoms: entryData.symptoms,
            mood: entryData.mood,
            notes: entryData.notes,
            isFirstDayOfCycle: entryData.isFirstDayOfCycle || false,
          });
        });
        // Calculate total logs and last log date
        const totalLogs = entries.length;
        const lastLogDate = entries.length > 0 ? entries.map(e => e.date).sort().reverse()[0] : null;
        const lastEntry = entries.length > 0 ? entries.sort((a, b) => b.date.localeCompare(a.date))[0] : undefined;
        const lastSymptoms = lastEntry?.symptoms || [];
        const lastMood = lastEntry?.mood || '';
        userList.push({
          id: userId,
          name: data.name || '',
          email: data.email || '',
          photoURL: data.photoURL || '',
          lastLogin: data.lastLogin || '',
          totalLogs,
          lastLogDate,
          lastSymptoms,
          lastMood,
        });
      }
      setUsers(userList);
      setLoading(false);
    };
    fetchUsersAndLogs();
  }, []);

  const handleViewAnalytics = async (user: User) => {
    setSelectedUser(user);
    setAnalyticsLoading(true);
    // Fetch period entries for this user
    const q = query(collection(db, 'periodEntries'), where('userId', '==', user.id));
    const querySnapshot = await getDocs(q);
    const entries: PeriodEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        userId: data.userId,
        date: data.date,
        flow: data.flow,
        symptoms: data.symptoms,
        mood: data.mood,
        notes: data.notes,
        isFirstDayOfCycle: data.isFirstDayOfCycle || false,
      });
    });
    // Calculate analytics
    const totalEntries = entries.length;
    const lastActivity = entries.length > 0 ? entries.map(e => e.date).sort().reverse()[0] : null;
    // Most common symptoms
    const symptomCount: Record<string, number> = {};
    entries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    // Last mood
    const lastEntry = entries.length > 0 ? entries.sort((a, b) => b.date.localeCompare(a.date))[0] : undefined;
    const lastMood = lastEntry?.mood || '';
    setUserAnalytics({
      totalEntries,
      lastActivity,
      topSymptoms,
      lastMood,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      lastLogin: user.lastLogin,
      lastLogDate: user.lastLogDate,
      lastSymptoms: user.lastSymptoms,
    });
    setAnalyticsLoading(false);
  };

  const closeAnalytics = () => {
    setSelectedUser(null);
    setUserAnalytics(null);
  };

  // Helper to filter entries by time
  const filterEntriesByPeriod = (entries: PeriodEntry[], period: '1d' | '1w' | '1y') => {
    const now = new Date();
    let cutoff = new Date();
    if (period === '1d') cutoff.setDate(now.getDate() - 1);
    if (period === '1w') cutoff.setDate(now.getDate() - 7);
    if (period === '1y') cutoff.setFullYear(now.getFullYear() - 1);
    return entries.filter(e => new Date(e.date) >= cutoff);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2 px-4"></th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2 px-4">
                        <div className="flex items-center justify-center w-10 h-10 relative">
                          <img
                            src={user.photoURL || ''}
                            alt={user.name}
                            className={`w-8 h-8 rounded-full object-cover bg-gray-200 block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${user.photoURL ? 'opacity-100' : 'opacity-0'}`}
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('opacity-0'); }}
                          />
                          <svg
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={`w-8 h-8 rounded-full bg-gray-200 block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${user.photoURL ? 'opacity-0' : 'opacity-100'}`}
                          >
                            <circle cx="16" cy="16" r="16" fill="#e5e7eb" />
                            <path d="M16 17c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.657-10 5v2h20v-2c0-3.343-6.686-5-10-5z" fill="#b0b3b8" />
                          </svg>
                          {isUserOnline(user.lastLogin) && (
                            <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full bg-green-500 border-2 border-white" title="Online"></span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-4 font-medium">{user.name}</td>
                      <td className="py-2 px-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewAnalytics(user)}>
                          View Analytics
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Analytics Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-lg max-w-2xl w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              onClick={closeAnalytics}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center gap-4 mb-4">
              {userAnalytics?.photoURL ? (
                <img src={userAnalytics.photoURL} alt={userAnalytics.name} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{userAnalytics?.name}</h2>
                <div className="text-gray-500 text-sm">{userAnalytics?.email}</div>
                {isUserOnline(userAnalytics?.lastLogin) && (
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 ml-2" title="Online"></span>
                )}
              </div>
            </div>
            <div className="print:bg-white">
              {analyticsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading analytics...</div>
              ) : userAnalytics ? (
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Last Login:</span> {userAnalytics.lastLogin ? new Date(userAnalytics.lastLogin).toLocaleString() : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Total Entries:</span> {userAnalytics.totalEntries}
                  </div>
                  <div>
                    <span className="font-medium">Last Log Date:</span> {userAnalytics.lastLogDate ? new Date(userAnalytics.lastLogDate).toLocaleDateString() : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Last Mood:</span> {userAnalytics.lastMood || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Recent Symptoms:</span> {userAnalytics.lastSymptoms && userAnalytics.lastSymptoms.length > 0 ? userAnalytics.lastSymptoms.join(', ') : '-'}
                  </div>
                  <div>
                    <span className="font-medium">Top Symptoms:</span>
                    {userAnalytics.topSymptoms.length === 0 ? (
                      <span className="ml-2 text-gray-500">None</span>
                    ) : (
                      <ul className="ml-4 list-disc">
                        {userAnalytics.topSymptoms.map(([symptom, count]: any) => (
                          <li key={symptom}>{symptom} ({count})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
