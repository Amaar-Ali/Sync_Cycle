import React from 'react';
import { format } from 'date-fns';
import { PeriodEntry } from '@/types/period';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Calendar, Droplet, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface EntriesViewProps {
  entries: PeriodEntry[];
  onEntryClick: (entry: PeriodEntry) => void;
}

const EntriesView = ({ entries, onEntryClick }: EntriesViewProps) => {
  const { toast } = useToast();

  const handleDelete = async (entry: PeriodEntry) => {
    if (!entry.id) {
      toast({
        title: "Error",
        description: "Cannot delete entry: No entry ID found",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'periodEntries', entry.id));
      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFlowColor = (flow: string) => {
    switch (flow) {
      case 'light':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'medium':
        return 'bg-pink-200 text-pink-800 border-pink-300';
      case 'heavy':
        return 'bg-pink-300 text-pink-800 border-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No entries found. Start by logging your first entry!
        </div>
      ) : (
        entries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div 
                  className="flex-1 cursor-pointer space-y-4"
                  onClick={() => onEntryClick(entry)}
                >
                  {/* Date and Flow Row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {format(new Date(entry.date), 'dd-MM-yyyy')}
                      </span>
                    </div>
                    <Badge className={getFlowColor(entry.flow)}>
                      <Droplet className="h-3 w-3 mr-1" />
                      {entry.flow.charAt(0).toUpperCase() + entry.flow.slice(1)} flow
                    </Badge>
                    {entry.isFirstDayOfCycle && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        First day of cycle
                      </Badge>
                    )}
                  </div>

                  {/* Symptoms Row */}
                  {entry.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.symptoms.map((symptom) => (
                        <Badge 
                          key={symptom} 
                          variant="secondary"
                          className="bg-gray-100 text-gray-700"
                        >
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Mood and Notes Row */}
                  <div className="flex flex-col gap-2">
                    {entry.mood && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart className="h-4 w-4" />
                        <span>{entry.mood}</span>
                      </div>
                    )}
                    {entry.notes && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MessageSquare className="h-4 w-4 mt-1" />
                        <span className="text-sm">{entry.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(entry);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default EntriesView; 