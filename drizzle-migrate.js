import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
const migrationDb = drizzle(migrationClient);
migrate(migrationDb, { migrationsFolder: "migrations" })
  .then(() => {
    console.log("Migrations ran successfully");
    process.exit();
  })
  .catch((error) => {
    console.log("Error running migrations", error);
    process.exit(1);
  });
