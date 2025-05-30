"use client";
import { useEffect, useState } from 'react';
import { AuditLogEntry } from '@/types';
import { getAuditLogEntries } from '@/lib/firebase/firestoreService';
import { format } from 'date-fns';
import { Loader2, ListChecks } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const auditEntries = await getAuditLogEntries();
        setLogs(auditEntries);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
        setError("Could not load audit logs.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <ListChecks size={30} className="mr-3 text-blue-600"/> Public Audit Log
      </h1>
      {logs.length === 0 ? (
        <p className="text-center text-gray-600">No audit log entries yet.</p>
      ) : (
        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">
                {format(log.timestamp.toDate(), 'yyyy-MM-dd HH:mm:ss')}
              </p>
              <p className="font-semibold text-gray-700">
                Event: <span className="text-indigo-600">{log.eventType}</span>
              </p>
              <p className="text-sm text-gray-600">
                Actor: {log.actorDisplayName || log.actorUserId}
              </p>
              {log.targetBountyTitle && <p className="text-sm text-gray-600">Bounty: {log.targetBountyTitle}</p>}
              {typeof log.details === 'string' && <p className="text-sm text-gray-600 mt-1">Details: {log.details}</p>}
              {typeof log.details === 'object' && <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}