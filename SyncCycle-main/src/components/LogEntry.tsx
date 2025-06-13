import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PeriodEntry } from '@/types/period';
import { useToast } from '@/hooks/use-toast';

interface LogEntryProps {
  onSaveEntry: (entry: PeriodEntry) => Promise<void>;
  selectedDate: string;
}

const LogEntry = ({ onSaveEntry, selectedDate }: LogEntryProps) => {
  const [date, setDate] = useState<Date>(selectedDate ? new Date(selectedDate) : new Date());
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFirstDayOfCycle, setIsFirstDayOfCycle] = useState(false);

  const symptomOptions = [
    'Cramps', 'Headache', 'Bloating', 'Breast tenderness',
    'Fatigue', 'Nausea', 'Back pain', 'Acne', 'Food cravings',
    'Mood swings', 'Irritability', 'Anxiety'
  ];

  const moodOptions = [
    '😊 Happy', '😌 Calm', '😢 Sad', '😠 Angry',
    '😰 Anxious', '😴 Tired', '🤗 Loving', '😤 Irritated'
  ];

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    if (checked) {
      setSymptoms([...symptoms, symptom]);
    } else {
      setSymptoms(symptoms.filter(s => s !== symptom));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Preparing to save entry...');
      console.log('Current date:', date);
      console.log('Current flow:', flow);
      console.log('Current symptoms:', symptoms);
      console.log('Current mood:', mood);
      console.log('Current notes:', notes);

      const entry: Omit<PeriodEntry, 'id'> = {
        date: format(date, 'yyyy-MM-dd'),
        flow,
        symptoms,
        mood,
        ...(notes.trim() ? { notes: notes.trim() } : {})
      };

      console.log('Formatted entry to save:', entry);
      await onSaveEntry(entry);
      console.log('Entry saved successfully');
      
      // Reset form
      setFlow('medium');
      setSymptoms([]);
      setMood('');
      setNotes('');
    } catch (error) {
      console.error('Error in LogEntry component:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Log Your Day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Flow Selection */}
          <div className="space-y-2">
            <Label>Flow</Label>
            <div className="flex items-center gap-4">
              <div className="flex gap-4">
                {(['light', 'medium', 'heavy'] as const).map((flowType) => (
                  <Button
                    key={flowType}
                    type="button"
                    variant={flow === flowType ? 'default' : 'outline'}
                    onClick={() => setFlow(flowType)}
                    className="capitalize"
                  >
                    {flowType}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Checkbox
                  id="firstDayOfCycle"
                  checked={isFirstDayOfCycle}
                  onCheckedChange={(checked) => setIsFirstDayOfCycle(checked as boolean)}
                />
                <Label htmlFor="firstDayOfCycle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  First day of cycle
                </Label>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="space-y-3">
            <Label>Symptoms</Label>
            <div className="grid grid-cols-2 gap-3">
              {symptomOptions.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={symptom}
                    checked={symptoms.includes(symptom)}
                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked === true)}
                  />
                  <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <Label>Mood</Label>
            <RadioGroup value={mood} onValueChange={setMood}>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map((moodOption) => (
                  <div key={moodOption} className="flex items-center space-x-2">
                    <RadioGroupItem value={moodOption} id={moodOption} />
                    <Label htmlFor={moodOption} className="text-sm">{moodOption}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes about your day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogEntry;
