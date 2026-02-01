import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export const createTables = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connected to PostgreSQL.");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'user',
                phone_number TEXT UNIQUE,
                curr_level INT DEFAULT 1,
                hint_taken BOOLEAN DEFAULT FALSE,
                curr_keys INT DEFAULT 3,
                hidden BOOLEAN DEFAULT FALSE,
                ans_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                img1 TEXT NOT NULL,
                img2 TEXT,
                img3 TEXT,
                img4 TEXT,
                hint TEXT,
                paid_hint TEXT,
                name TEXT,
                hint_cost INTEGER NOT NULL,
                level INTEGER UNIQUE NOT NULL,
                tooltip TEXT NOT NULL,
                close_answers TEXT,
                answer TEXT NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS answer_histories (
                id SERIAL PRIMARY KEY,
                username TEXT,
                level INTEGER,
                answers TEXT,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (username) REFERENCES users(username),
                FOREIGN KEY (level) REFERENCES questions(level),
                UNIQUE (username, level)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS event_status (
                id SERIAL PRIMARY KEY,
                status TEXT NOT NULL DEFAULT 'inactive',
                intervals TEXT,
                start_time TIMESTAMP WITH TIME ZONE,
                end_time TIMESTAMP WITH TIME ZONE
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS backup_settings (
                id SERIAL PRIMARY KEY,
                enabled BOOLEAN DEFAULT FALSE,
                interval_seconds INTEGER DEFAULT 3600,
                last_backup TIMESTAMP WITH TIME ZONE
            );
        `);

        client.release();
        console.log("✅ Tables ensured.");
    } catch (err) {
        console.error("❌ Error creating tables: ", err);
        process.exit(1);
    }
};

export default pool;
