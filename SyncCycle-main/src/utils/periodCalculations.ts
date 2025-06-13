import { DayInfo, CycleData } from '@/types/period';

export const calculateCyclePhase = (
  date: Date,
  lastPeriodStart: Date,
  cycleLength: number,
  periodLength: number
): DayInfo => {
  const daysDiff = Math.floor((date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
  const dayOfCycle = (daysDiff % cycleLength) + 1;

  let phase: DayInfo['phase'] = null;
  let isPeriod = false;
  let isOvulation = false;
  let isFertile = false;

  // Calculate ovulation day (typically 14 days before next period)
  const ovulationDay = cycleLength - 14;
  
  if (dayOfCycle <= periodLength) {
    phase = 'period';
    isPeriod = true;
  } else if (dayOfCycle <= ovulationDay - 3) {
    phase = 'follicular';
  } else if (dayOfCycle >= ovulationDay - 2 && dayOfCycle <= ovulationDay + 2) {
    phase = 'ovulation';
    isOvulation = dayOfCycle === ovulationDay;
    isFertile = true;
  } else if (dayOfCycle <= cycleLength - 5) {
    phase = 'luteal';
  } else {
    phase = 'pms';
  }

  // Fertile window (5 days before and 1 day after ovulation)
  if (dayOfCycle >= ovulationDay - 5 && dayOfCycle <= ovulationDay + 1) {
    isFertile = true;
  }

  return {
    date: date.toISOString().split('T')[0],
    phase,
    isPeriod,
    isOvulation,
    isFertile,
    dayOfCycle
  };
};

export const getPredictedPeriods = (cycleData: CycleData, monthsAhead = 3): Date[] => {
  const periods: Date[] = [];
  const lastPeriod = new Date(cycleData.lastPeriodStart);
  
  // Use the actual cycle length for the first prediction
  let nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(lastPeriod.getDate() + cycleData.cycleLength);
  periods.push(nextPeriod);
  
  // Use average cycle length for subsequent predictions
  for (let i = 2; i <= monthsAhead; i++) {
    const predictedPeriod = new Date(lastPeriod);
    predictedPeriod.setDate(lastPeriod.getDate() + (cycleData.averageCycleLength * i));
    periods.push(predictedPeriod);
  }
  
  return periods;
};

export const getPhaseColor = (phase: DayInfo['phase']): string => {
  switch (phase) {
    case 'period':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'follicular':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'ovulation':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'luteal':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'pms':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-600';
  }
};
