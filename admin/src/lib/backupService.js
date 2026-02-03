import pool from "@/lib/db";

const REQUIRED_ENVS = ["GITHUB_TOKEN", "GITHUB_REPO", "BACKUP_TOKEN"];

const assertEnv = () => {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
};

const fetchTables = async () => {
  const tablesResult = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  return tablesResult.rows.map((row) => row.tablename);
};

const generateBackupFileName = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `nth-backup-${day}-${month}-${year}_${hours}-${minutes}`;
};

const uploadToGitHub = async (fileName, content) => {
  const [owner, repo] = process.env.GITHUB_REPO.split("/");
  const branch = process.env.GITHUB_BRANCH || "main";
  const backupPath = `backups/${fileName}`;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${backupPath}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
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

export const performBackup = async () => {
  assertEnv();

  const backupName = generateBackupFileName();
  const tables = await fetchTables();

  const meta = {
    generatedAt: new Date().toISOString(),
    tableCount: tables.length,
    tables,
  };

  const backupData = {
    metadata: meta,
    tables: {},
  };

  for (const table of tables) {
    const result = await pool.query(`SELECT * FROM ${table}`);
    backupData.tables[table] = result.rows;
  }

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
