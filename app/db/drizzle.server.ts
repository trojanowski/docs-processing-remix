import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.server";

if (!process.env.DATABASE_URL) {
  throw new Error("environment variable: DATABASE_URL is missing.");
}

const queryClient = postgres(process.env.DATABASE_URL);
export const db = drizzle(queryClient, {
  schema,
});
