import fnKnex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = fnKnex({
    client: 'mysql2',
    connection:
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    pool: { min: 0, max: 7 }
});
export default db