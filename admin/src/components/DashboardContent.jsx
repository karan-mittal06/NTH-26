"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const DashboardContent = () => {
  const [driveStatus, setDriveStatus] = useState({ connected: false, loading: true });
  const [backupLoading, setBackupLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    checkDriveStatus();
  }, []);

  const checkDriveStatus = async () => {
    try {
      const res = await fetch("/api/drive-oauth/status");
      const data = await res.json();
      setDriveStatus({ ...data, loading: false });
    } catch (error) {
      console.error("Failed to check Drive status:", error);
      setDriveStatus({ connected: false, loading: false });
    }
  };

  const connectDrive = async () => {
    try {
      const res = await fetch("/api/drive-oauth/authorize");
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Failed to initiate OAuth:", error);
      setMessage({ type: "error", text: "Failed to connect to Google Drive" });
    }
  };

  const disconnectDrive = async () => {
    try {
      await fetch("/api/drive-oauth/revoke", { method: "DELETE" });
      setMessage({ type: "success", text: "Google Drive disconnected" });
      checkDriveStatus();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      setMessage({ type: "error", text: "Failed to disconnect" });
    }
  };

  const createBackup = async () => {
    setBackupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: {
          "x-backup-token": process.env.NEXT_PUBLIC_BACKUP_TOKEN || "default-token",
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: "Backup created successfully!" });
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

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center pb-24 gap-8">
      <p className="md:text-9xl text-5xl">NTH Admin</p>

      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium">Google Drive:</span>
          {driveStatus.loading ? (
            <span className="text-gray-400">Checking...</span>
          ) : driveStatus.connected ? (
            <span className="text-green-500 font-semibold">✓ Connected</span>
          ) : (
            <span className="text-red-500 font-semibold">✗ Not Connected</span>
          )}
        </div>

        <div className="flex gap-3">
          {!driveStatus.connected ? (
            <Button onClick={connectDrive} variant="default">
              Connect Google Drive
            </Button>
          ) : (
            <>
              <Button onClick={createBackup} disabled={backupLoading} variant="default">
                {backupLoading ? "Creating Backup..." : "Create Backup"}
              </Button>
              <Button onClick={disconnectDrive} variant="destructive">
                Disconnect Drive
              </Button>
            </>
          )}
        </div>

        {message && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardContent;
