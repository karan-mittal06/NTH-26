# NTH Database Backup & Recovery Guide

## Overview

The NTH backup system creates JSON exports of all database tables and uploads them to a **private GitHub repository**. This allows for easy recovery in case of data loss.

---

## Setup: GitHub Token & Repository

### 1. Create a Private GitHub Repository

1. Go to [GitHub](https://github.com/) and create a new **private** repository
2. Name it something like `nth-backups`
3. Keep it empty (no README, .gitignore, etc.)

### 2. Create a Personal Access Token (Fine-grained)

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
2. Click "Generate new token"
3. Name: `NTH Backup Token`
4. Expiration: Set to "No expiration" or a long period
5. Repository access: Select "Only select repositories" → choose your backup repo
6. Permissions:
   - Contents: **Read and Write**
7. Click "Generate token"
8. **Copy the token immediately** (you won't see it again!)

### 3. Set Environment Variables

Add to your `.env` file (admin folder):

```env
# GitHub Backup (FREE!)
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxx
GITHUB_REPO=yourusername/nth-backups
GITHUB_BRANCH=main

# Backup Security Token (generate with: openssl rand -hex 32)
BACKUP_TOKEN=your-secure-random-token-here
NEXT_PUBLIC_BACKUP_TOKEN=your-secure-random-token-here
```

---

## How to Use

### From Dashboard

1. Go to `/dashboard`
2. Click "Create Backup" button
3. Click "View Backups" to see all backups in GitHub

### Manual Backup (API)

```bash
curl -X POST http://localhost:3000/api/backup \
  -H "x-backup-token: your-backup-token"
```

### List Backups (API)

```bash
curl http://localhost:3000/api/backup \
  -H "x-backup-token: your-backup-token"
```

---

## Backup Format

Backups are stored as JSON files in the `backups/` folder of your GitHub repo:

```
nth-backups/
└── backups/
    ├── nth-backup-03-02-2026_14-30.json
    ├── nth-backup-02-02-2026_10-15.json
    └── ...
```

Each backup contains:
```json
{
  "metadata": {
    "generatedAt": "2026-02-03T14:30:00.000Z",
    "tableCount": 5,
    "tables": ["users", "questions", "answers", ...]
  },
  "tables": {
    "users": [...],
    "questions": [...],
    ...
  }
}
```

---

## Recovery Process

### 1. Download Backup

From GitHub, download the JSON backup file you want to restore.

### 2. Run Recovery Script

```bash
cd admin
node recovery.js path/to/backup.json
```

Or manually:

```javascript
const backup = require('./backup.json');

for (const [table, rows] of Object.entries(backup.tables)) {
  // Clear existing data
  await pool.query(`DELETE FROM ${table}`);
  
  // Insert backup data
  for (const row of rows) {
    // ... insert logic
  }
}
```

---

## Deployment to Azure Linux VM

### Environment Variables on Azure

Add these to your Azure VM environment or `.env` file:

```env
GITHUB_TOKEN=github_pat_xxxxxxxxxxxxx
GITHUB_REPO=yourusername/nth-backups
GITHUB_BRANCH=main
BACKUP_TOKEN=your-secure-token
NEXT_PUBLIC_BACKUP_TOKEN=your-secure-token
```

---

## Security Notes

- **Never commit `.env` files** to git
- Use a **private** GitHub repository for backups
- Keep `BACKUP_TOKEN` secure
- Rotate GitHub token periodically
- Fine-grained tokens are more secure than classic tokens

---

## Why GitHub vs Google Drive?

| Feature | GitHub | Google Drive |
|---------|--------|--------------|
| **Cost** | ✅ FREE | ❌ Service Account needs Workspace ($) |
| **Setup** | Very Easy | Complex OAuth |
| **Version History** | ✅ Built-in | Manual |
| **Storage** | Unlimited (small files) | 15GB free |
| **API** | Simple REST | Complex |

**TL;DR**: GitHub is simpler, free, and has built-in version control! 🎉

