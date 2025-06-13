import { Calendar, User, BarChart3, Shield, LogOut, FileText, List, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const { user, isAdmin, logout } = useAuth();

  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'log', label: 'Log Entry', icon: User },
    { id: 'entries', label: 'Entries', icon: List },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'relief', label: 'Relief Ideas', icon: HeartPulse },
  ];

  if (isAdmin) {
    tabs.push(
      { id: 'admin', label: 'Admin', icon: Shield },
      { id: 'logs', label: 'System Logs', icon: FileText }
    );
  }

  return (
    <header className="mt-4">
      <div className="w-full px-4 py-6 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 leading-tight pb-2" style={{fontFamily: 'Poppins, Nunito, Inter, sans-serif'}}>SyncCycle</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={user?.photoURL || ''} 
                alt={user?.displayName || 'User'} 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600">{user?.displayName}</span>
            </div>
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="flex justify-center">
          <div className="flex bg-white rounded-full p-1 shadow-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
