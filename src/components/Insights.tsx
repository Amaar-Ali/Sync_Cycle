import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, TrendingUp, Heart, Clock } from 'lucide-react';
import { PeriodEntry, CycleData } from '@/types/period';
import { calculateCyclePhase, getPredictedPeriods } from '@/utils/periodCalculations';

interface InsightsProps {
  cycleData: CycleData;
  periodEntries: PeriodEntry[];
}

const Insights = ({ cycleData, periodEntries }: InsightsProps) => {
  const insights = useMemo(() => {
    const today = new Date();
    const currentCycleInfo = calculateCyclePhase(
      today,
      new Date(cycleData.lastPeriodStart),
      cycleData.cycleLength,
      cycleData.periodLength
    );

    const nextPeriods = getPredictedPeriods(cycleData, 2);
    const daysUntilNextPeriod = Math.ceil(
      (nextPeriods[0].getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate most common symptoms
    const symptomCount: Record<string, number> = {};
    periodEntries.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });

    const topSymptoms = Object.entries(symptomCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Calculate cycle progress
    const cycleProgress = ((currentCycleInfo.dayOfCycle - 1) / cycleData.cycleLength) * 100;

    return {
      currentPhase: currentCycleInfo.phase,
      dayOfCycle: currentCycleInfo.dayOfCycle,
      daysUntilNextPeriod,
      cycleProgress,
      topSymptoms,
      totalEntries: periodEntries.length
    };
  }, [cycleData, periodEntries]);

  const getPhaseDisplay = (phase: string | null) => {
    switch (phase) {
      case 'period':
        return { name: 'Menstrual', color: 'text-red-600', bg: 'bg-red-50' };
      case 'follicular':
        return { name: 'Follicular', color: 'text-green-600', bg: 'bg-green-50' };
      case 'ovulation':
        return { name: 'Ovulation', color: 'text-pink-600', bg: 'bg-pink-50' };
      case 'luteal':
        return { name: 'Luteal', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'pms':
        return { name: 'PMS', color: 'text-purple-600', bg: 'bg-purple-50' };
      default:
        return { name: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const phaseInfo = getPhaseDisplay(insights.currentPhase);

  // Find the most recent first day of cycle
  const recentFirstDayEntry = [...periodEntries].reverse().find(e => e.isFirstDayOfCycle === true);
  let firstDayDate: Date | null = null;
  if (recentFirstDayEntry) {
    firstDayDate = new Date(recentFirstDayEntry.date);
  } else {
    // Default to 11 June 2025 if no first day is found
    firstDayDate = new Date('2025-06-11');
  }
  const cycleLen = cycleData.cycleLength;
  const periodLen = cycleData.periodLength;

  // Calculate predictions
  let ovulationDate: Date | null = null;
  let pmsStartDate: Date | null = null;
  let nextPeriodDate: Date | null = null;
  if (firstDayDate) {
    nextPeriodDate = new Date(firstDayDate);
    nextPeriodDate.setDate(firstDayDate.getDate() + cycleLen);
    ovulationDate = new Date(firstDayDate);
    ovulationDate.setDate(firstDayDate.getDate() + (cycleLen - 14));
    pmsStartDate = new Date(firstDayDate);
    pmsStartDate.setDate(firstDayDate.getDate() + cycleLen - 5);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Current Cycle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${phaseInfo.bg}`}>
                <Heart className={`h-5 w-5 ${phaseInfo.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Phase</p>
                <p className={`font-semibold ${phaseInfo.color}`}>{phaseInfo.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Day of Cycle</p>
                <p className="font-semibold">{insights.dayOfCycle} of {cycleData.cycleLength}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-50">
                <Clock className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Period</p>
                <p className="font-semibold">{insights.daysUntilNextPeriod} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Logged Days</p>
                <p className="font-semibold">{insights.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cycle Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Cycle Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Day {insights.dayOfCycle} of {cycleData.cycleLength}</span>
              <span>{Math.round(insights.cycleProgress)}%</span>
            </div>
            <Progress value={insights.cycleProgress} className="h-2" />
            <div className="text-sm text-muted-foreground text-center">
              Current phase: <span className={phaseInfo.color}>{phaseInfo.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Symptoms */}
      {insights.topSymptoms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Common Symptoms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topSymptoms.map(([symptom, count]) => (
                <div key={symptom} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{symptom}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / insights.totalEntries) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average cycle length</span>
              <span className="font-medium">{cycleData.averageCycleLength} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period length</span>
              <span className="font-medium">{cycleData.periodLength} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last period started</span>
              <span className="font-medium">
                {new Date(cycleData.lastPeriodStart).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {getPredictedPeriods(cycleData, 2).map((date, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {index === 0 ? 'Next period' : 'Following period'}
                </span>
                <span className="font-medium">
                  {date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            ))}

            {/* PMS & Ovulation Predictions */}
            <div className="mt-6 space-y-2">
              <div>
                <span className="font-medium">First Day of Cycle:</span> {firstDayDate ? firstDayDate.toLocaleDateString('en-GB') : '-'}
              </div>
              <div>
                <span className="font-medium">Predicted Ovulation:</span> {ovulationDate ? ovulationDate.toLocaleDateString('en-GB') : '-'}
              </div>
              <div>
                <span className="font-medium">Predicted PMS Start:</span> {pmsStartDate ? pmsStartDate.toLocaleDateString('en-GB') : '-'}
              </div>
              <div>
                <span className="font-medium">Predicted Next Period:</span> {nextPeriodDate ? nextPeriodDate.toLocaleDateString('en-GB') : '-'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insights;
