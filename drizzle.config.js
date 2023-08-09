/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./app/db/schema.server.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  out: "./migrations",
};
