"use client";
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [startTime, setStartTime] = useState("")
  const [status, setStatus] = useState('inactive');
  const [warning, setWarning] = useState(false);

  // Auto-backup state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupInterval, setBackupInterval] = useState(3600); // default 1 hour
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/superusers-admin/api/timer");
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 404) {
            setWarning(true);
          } 
        }
        
        console.log("Raw start_time:", data.start_time);

        // Create date object from the UTC timestamp
        const date = new Date(data.start_time);
        console.log("Parsed Date:", date);

        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log("Formatted DateTime:", formattedDateTime);

        setStartTime(formattedDateTime || "");
        setStatus(data.status || "inactive");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const getBackupSettings = async () => {
      try {
        const response = await fetch("/superusers-admin/api/auto-backup");
        if (response.ok) {
          const data = await response.json();
          setAutoBackupEnabled(data.enabled || false);
          setBackupInterval(data.interval_seconds || 3600);
        }
      } catch (error) {
        console.error("Error fetching backup settings:", error);
      }
    };

    getData();
    getBackupSettings();
  }, []);
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(startTime);
    const date = new Date(startTime);
    console.log(date);
    if (status === 'active'){
      try{
        const response = await fetch("/superusers-admin/api/timer",{
          method: "DELETE",
        });
        const data = await response.json(); // Await the parsing of JSON
        if (!response.ok) {
          throw new Error(data.error);
        }
        alert(data.message);
      }catch (error){
        console.error("Error fetching data:", error);
      }
    }else{
      try{
        const response = await fetch("/superusers-admin/api/timer",{
          method: "POST",
          headers:{
            "Content-Type":"application/json",
          },
          body: JSON.stringify({start_time: date.toISOString()}),
        });
        const data = await response.json(); // Await the parsing of JSON
        if (!response.ok) {
          throw new Error(data.error);
        }
        alert(data.message);
      }catch (error){
        console.error("Error fetching data:", error);
      }
    }
  }

  const handleAutoBackupToggle = async () => {
    setBackupLoading(true);
    try {
      if (autoBackupEnabled) {
        // Stop auto-backup
        const response = await fetch("/superusers-admin/api/auto-backup", {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setAutoBackupEnabled(false);
        alert("Auto-backup stopped");
      } else {
        // Validate interval
        if (backupInterval < 600) {
          alert("Interval must be at least 600 seconds (10 minutes)");
          setBackupLoading(false);
          return;
        }
        // Start auto-backup
        const response = await fetch("/superusers-admin/api/auto-backup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval_seconds: backupInterval }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setAutoBackupEnabled(true);
        alert(`Auto-backup started with ${backupInterval}s interval`);
      }
    } catch (error) {
      console.error("Auto-backup error:", error);
      alert(error.message);
    }
    setBackupLoading(false);
  };

  return (
    <div className="flex flex-col px-4 justify-center items-center min-h-screen py-20 gap-12">
      {/* Event Timer Section */}
      <div className="w-full max-w-md">
        {warning && <p className='text-center text-red-600'>Create new Timer</p>}
        <h1 className="text-2xl font-bold mb-6 text-center">EVENT TIMER</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="w-full flex flex-col gap-2 px-4">
            <Label htmlFor="start_time" className="">
              Start Time
            </Label>
            <input 
              id="start_time" 
              type="datetime-local" 
              className=' bg-transparent p-2 rounded-lg border active:border-white [&::-webkit-calendar-picker-indicator]:invert'
              value={startTime}
              onChange={(e)=>{
                setStartTime(e.target.value);
                console.log(e.target.value);
              }}
            />
          </div>
          <div className="w-full flex flex-col gap-2 px-4">
            <Label htmlFor="Status" className="">
              Event Status (checked - active)
            </Label>
            <Checkbox 
              id="Status" 
              checked={status==='active'?true:false} 
              disabled = {true}
            />
          </div>
          <div className="w-full flex flex-col gap-2 px-4">
            <Button 
              className="mx-auto w-fit"
              type="submit"
            >
              {status==='active'?"End Event":"Start Timer"}
            </Button>
          </div>
        </form>
      </div>

      {/* Auto-Backup Section */}
      <div className="w-full max-w-md border-t pt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">AUTO-BACKUP</h1>
        <div className="space-y-6">
          <div className="w-full flex flex-col gap-2 px-4">
            <Label htmlFor="backup_interval">
              Backup Interval (seconds, min 600)
            </Label>
            <Input
              id="backup_interval"
              type="number"
              min={600}
              value={backupInterval}
              onChange={(e) => setBackupInterval(parseInt(e.target.value) || 600)}
              disabled={autoBackupEnabled}
              className="bg-transparent"
            />
            <p className="text-sm text-gray-400">
              {Math.floor(backupInterval / 3600)}h {Math.floor((backupInterval % 3600) / 60)}m {backupInterval % 60}s
            </p>
          </div>
          <div className="w-full flex items-center gap-4 px-4">
            <Checkbox
              id="auto_backup_enabled"
              checked={autoBackupEnabled}
              onCheckedChange={handleAutoBackupToggle}
              disabled={backupLoading}
            />
            <Label htmlFor="auto_backup_enabled">
              {autoBackupEnabled ? "Auto-Backup Active" : "Enable Auto-Backup"}
            </Label>
          </div>
          <p className="text-sm text-gray-400 px-4">
            {autoBackupEnabled 
              ? `✅ Backing up every ${Math.floor(backupInterval / 60)} minutes to Google Drive` 
              : "Toggle to start automatic backups"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page
