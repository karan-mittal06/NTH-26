import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import pool from "@/lib/db";

const REQUIRED_ENVS = [
  "GITHUB_TOKEN",
  "GITHUB_REPO",
  "BACKUP_TOKEN",
];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const fetchTables = async () => {
  const tablesResult = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  return tablesResult.rows.map((row) => row.tablename);
};

// Generate filename for backup
const generateBackupFileName = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `nth-backup-${day}-${month}-${year}_${hours}-${minutes}`;
};

// Upload file to GitHub
const uploadToGitHub = async (fileName, content) => {
  const [owner, repo] = process.env.GITHUB_REPO.split("/");
  const branch = process.env.GITHUB_BRANCH || "main";
  const backupPath = `backups/${fileName}`;
  
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${backupPath}`;
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/vnd.github.v3+json",
    },
    body: JSON.stringify({
      message: `Backup: ${fileName}`,
      content: Buffer.from(content).toString("base64"),
      branch: branch,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub upload failed: ${error.message || response.statusText}`);
  }

  return response.json();
};

// Core backup function
export const performBackup = async () => {
  assertEnv();

  const backupName = generateBackupFileName();
  const tables = await fetchTables();
  
  const meta = {
    generatedAt: new Date().toISOString(),
    tableCount: tables.length,
    tables,
  };

  // Create backup data object
  const backupData = {
    metadata: meta,
    tables: {},
  };

  // Fetch all table data
  for (const table of tables) {
    const result = await pool.query(`SELECT * FROM ${table}`);
    backupData.tables[table] = result.rows;
  }

  // Upload as single JSON file to GitHub
  const fileName = `${backupName}.json`;
  const content = JSON.stringify(backupData, null, 2);
  
  const githubResult = await uploadToGitHub(fileName, content);

  return {
    name: fileName,
    path: githubResult.content?.path,
    sha: githubResult.content?.sha,
    url: githubResult.content?.html_url,
  };
};

// GET - List recent backups from GitHub
export async function GET(request) {
  try {
    assertEnv();

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
    assertEnv();

    const token = request.headers.get("x-backup-token");
    if (!token || token !== process.env.BACKUP_TOKEN) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const result = await performBackup();

    return NextResponse.json(
      {
        message: "Backup created and uploaded to GitHub",
        file: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { message: "Backup failed", error: error.message },
      { status: 500 }
    );
  }
}
