import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getLogs } from '@/utils/logger';
import { LogEntry } from '@/types/period';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const LogViewer = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      
      try {
        const fetchedLogs = await getLogs(user.uid);
        setLogs(fetchedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading logs...</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">System Logs</h2>
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(log.timestamp, 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>
                  <Badge className={getLevelColor(log.level)}>
                    {log.level}
                  </Badge>
                </TableCell>
                <TableCell>{log.component || '-'}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  {log.details ? (
                    <pre className="text-xs">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default LogViewer; 