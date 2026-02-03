import { NextResponse } from "next/server";
import { performBackup } from "@/lib/backupService";
import { recordBackupRun } from "@/lib/backupScheduler";

// GET - List recent backups from GitHub
export async function GET(request) {
  try {
    const token = request.headers.get("x-backup-token");
    if (!token || token !== process.env.BACKUP_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const branch = process.env.GITHUB_BRANCH || "main";
    
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/backups?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (response.status === 404) {
      return NextResponse.json({ backups: [], message: "No backups found" }, { status: 200 });
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list backups");
    }

    const files = await response.json();
    const backups = files
      .filter(f => f.name.endsWith(".json"))
      .map(f => ({
        name: f.name,
        path: f.path,
        sha: f.sha,
        size: f.size,
        url: f.html_url,
        download_url: f.download_url,
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Most recent first

    return NextResponse.json({ backups }, { status: 200 });
  } catch (error) {
    console.error("List backups error:", error);
    return NextResponse.json(
      { message: "Failed to list backups", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new backup
export async function POST(request) {
  try {
    const token = request.headers.get("x-backup-token");
    if (!token || token !== process.env.BACKUP_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await performBackup();
    await recordBackupRun({ success: true });

    return NextResponse.json(
      {
        message: "Backup created and uploaded to GitHub",
        file: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Backup error:", error);
    await recordBackupRun({ success: false, error: error.message });
    return NextResponse.json(
      { message: "Backup failed", error: error.message },
      { status: 500 }
    );
  }
}
