#!/usr/bin/env node
/**
 * NTH Database Recovery Script
 * 
 * Usage:
 *   node recovery.js <path-to-backup.zip>
 * 
 * This script:
 * 1. Extracts the backup ZIP
 * 2. Reads JSON files for each table
 * 3. Restores data to the PostgreSQL database
 * 
 * Prerequisites:
 * - Node.js installed
 * - Set DATABASE_URL environment variable
 * - npm install pg archiver (or run from admin folder)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('Usage: DATABASE_URL=postgres://user:pass@host:port/db node recovery.js backup.zip');
  process.exit(1);
}

const zipPath = process.argv[2];

if (!zipPath) {
  console.error('❌ Please provide the path to the backup ZIP file');
  console.log('Usage: DATABASE_URL=postgres://... node recovery.js <backup.zip>');
  process.exit(1);
}

if (!fs.existsSync(zipPath)) {
  console.error(`❌ File not found: ${zipPath}`);
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const extractDir = path.join(process.cwd(), `recovery-${Date.now()}`);

async function main() {
  try {
    console.log('📦 Extracting backup...');
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: 'inherit' });

    // Read metadata
    const metaPath = path.join(extractDir, '_metadata.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      console.log(`📋 Backup from: ${meta.generatedAt}`);
      console.log(`📋 Tables: ${meta.tables.join(', ')}`);
    }

    // Get all JSON files (excluding metadata)
    const files = fs.readdirSync(extractDir).filter(f => f.endsWith('.json') && f !== '_metadata.json');

    console.log(`\n🔄 Restoring ${files.length} tables...`);

    for (const file of files) {
      const tableName = path.basename(file, '.json');
      const filePath = path.join(extractDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (data.length === 0) {
        console.log(`⏭️  Skipping ${tableName} (no data)`);
        continue;
      }

      console.log(`📥 Restoring ${tableName} (${data.length} rows)...`);

      // Clear existing data
      await pool.query(`DELETE FROM ${tableName}`);

      // Insert data row by row
      for (const row of data) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        
        try {
          await pool.query(query, values);
        } catch (err) {
          console.warn(`  ⚠️  Error inserting row into ${tableName}: ${err.message}`);
        }
      }

      console.log(`✅ ${tableName} restored`);
    }

    // Cleanup
    fs.rmSync(extractDir, { recursive: true, force: true });

    console.log('\n✅ Recovery complete!');
  } catch (error) {
    console.error('❌ Recovery failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
