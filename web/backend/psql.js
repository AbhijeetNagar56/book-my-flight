import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DB
});

const connectDB = async () => {
    try {

        const client = await pool.connect();

        console.log("PostgreSQL Connected");

        client.release();

    } catch(err) {

        console.error("Error connecting PostgreSQL:", err.message);

        setTimeout(() => {
            process.exit(1);
        }, 1000);

    }
};

export { pool, connectDB };