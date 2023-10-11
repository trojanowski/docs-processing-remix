import { sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export function addJob(
  db: PostgresJsDatabase | PgTransaction<any, any, any>,
  jobName: string,
  payload: unknown
) {
  return db.execute(
    // `$queryRaw` escapes arguments preventing from SQL injections:
    // https://orm.drizzle.team/docs/sql#sql-template
    sql`SELECT graphile_worker.add_job(${jobName}, ${payload}::json)`
  );
}
