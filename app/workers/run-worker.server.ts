import { run } from "graphile-worker";
import invariant from "tiny-invariant";

import { processDocument } from "./process-document.server";

export async function runWorker() {
  invariant(
    process.env.DATABASE_URL,
    "DATABASE_URL environment variable is required"
  );

  await run({
    connectionString: process.env.DATABASE_URL,
    concurrency: 4,
    pollInterval: 1000,
    taskList: {
      processDocument,
    },
  });
}
