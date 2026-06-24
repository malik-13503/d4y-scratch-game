import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS winner_wall_entries (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    prize TEXT NOT NULL,
    prize_color TEXT NOT NULL DEFAULT '#7c3aed',
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;
console.log("winner_wall_entries table ready");
process.exit(0);
