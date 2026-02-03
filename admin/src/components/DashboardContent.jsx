"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const DashboardContent = () => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [backups, setBackups] = useState([]);
  const [message, setMessage] = useState(null);
  const [showBackups, setShowBackups] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [autoBackupSeconds, setAutoBackupSeconds] = useState(600);

  const createBackup = async () => {
    setBackupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/superusers-admin/api/backup", {
        method: "POST",
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: `Backup created: ${data.file?.name}` });
        if (showBackups) fetchBackups();
      } else {
        setMessage({ type: "error", text: data.message || "Backup failed" });
      }
    } catch (error) {
      console.error("Backup failed:", error);
      setMessage({ type: "error", text: "Backup failed" });
    } finally {
      setBackupLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch("/superusers-admin/api/backup", {
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups || []);
        setShowBackups(true);
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    }
  };

  useEffect(() => {
    if (!autoBackupEnabled || autoBackupSeconds < 600) return;

    const intervalId = setInterval(() => {
      if (!backupLoading) {
        createBackup();
      }
    }, autoBackupSeconds * 1000);

    return () => clearInterval(intervalId);
  }, [autoBackupEnabled, autoBackupSeconds, backupLoading, createBackup]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center pb-24 gap-8">
      <p className="md:text-9xl text-5xl">NTH Admin</p>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex gap-3">
          <Button onClick={createBackup} disabled={backupLoading} variant="default">
            {backupLoading ? "Creating Backup..." : "Create Backup"}
          </Button>
          <Button onClick={fetchBackups} variant="outline">
            View Backups
          </Button>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <label className="text-sm font-medium" htmlFor="auto-backup-seconds">
            Auto Backup (seconds)
          </label>
          <input
            id="auto-backup-seconds"
            type="number"
            min={600}
            step={1}
            className="w-32 rounded border px-2 py-1 text-sm bg-transparent"
            value={autoBackupSeconds}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isNaN(value)) return;
              setAutoBackupSeconds(Math.max(600, value));
            }}
          />
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={(e) => setAutoBackupEnabled(e.target.checked)}
            />
            Enable
          </label>
        </div>
        <p className="text-xs text-gray-500">Minimum interval is 600 seconds.</p>

        {message && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {showBackups && (
          <div className="mt-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Recent Backups (GitHub)</h3>
            {backups.length === 0 ? (
              <p className="text-gray-500">No backups found</p>
            ) : (
              <ul className="space-y-2">
                {backups.slice(0, 10).map((backup) => (
                  <li key={backup.sha} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                    <span className="text-sm truncate">{backup.name}</span>
                    <a
                      href={backup.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
