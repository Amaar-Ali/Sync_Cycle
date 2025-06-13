import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PeriodEntry } from '@/types/period';
import { HeartPulse, Smile, Sun, Coffee, Droplet, Leaf } from 'lucide-react';

interface ReliefIdeasProps {
  periodEntries: PeriodEntry[];
}

// Example relief ideas for common symptoms
const RELIEF_IDEAS: Record<string, { icon: React.ReactNode; ideas: string[] }> = {
  Cramps: {
    icon: <Droplet className="text-pink-400" />,
    ideas: [
      'Use a heating pad on your abdomen',
      'Try gentle yoga or stretching',
      'Stay hydrated and rest',
    ],
  },
  Headache: {
    icon: <Coffee className="text-purple-400" />,
    ideas: [
      'Drink water and rest in a dark room',
      'Try a warm or cold compress',
      'Limit screen time',
    ],
  },
  Bloating: {
    icon: <Leaf className="text-green-400" />,
    ideas: [
      'Eat smaller, more frequent meals',
      'Avoid salty foods',
      'Try gentle movement or walking',
    ],
  },
  Fatigue: {
    icon: <Sun className="text-yellow-400" />,
    ideas: [
      'Take short naps if needed',
      'Get some fresh air and sunlight',
      'Prioritize restful sleep',
    ],
  },
  Acne: {
    icon: <Smile className="text-blue-400" />,
    ideas: [
      'Keep your skin clean and moisturized',
      'Avoid touching your face',
      'Use gentle skincare products',
    ],
  },
};

const ReliefIdeas: React.FC<ReliefIdeasProps> = ({ periodEntries }) => {
  // Find the most recent entry with symptoms
  const recentEntry = periodEntries.slice().reverse().find(e => e.symptoms && e.symptoms.length > 0);
  const symptoms = recentEntry?.symptoms || [];

  // If no symptoms, show a friendly message
  if (symptoms.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="text-pink-400" />
              Relief Ideas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center py-8">
              Log your symptoms to get personalized relief ideas!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="text-pink-400" />
            Relief Ideas for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {symptoms.map(symptom => (
              <div key={symptom} className="rounded-xl bg-white/70 shadow p-5 flex gap-4 items-start">
                <div className="mt-1">{RELIEF_IDEAS[symptom]?.icon || <Smile className="text-gray-400" />}</div>
                <div>
                  <div className="font-semibold text-lg text-gray-700 mb-1">{symptom}</div>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    {(RELIEF_IDEAS[symptom]?.ideas || ['Rest, hydrate, and take care!']).map((idea, idx) => (
                      <li key={idx}>{idea}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReliefIdeas; 