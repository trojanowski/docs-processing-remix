import { type Serve } from "bun";
import { resolve } from "node:path";

import { createRequestHandler, logDevReady } from "@remix-run/server-runtime";

import * as build from "./build";

if (Bun.env.NODE_ENV === "development") {
  logDevReady(build);
}

export default {
  port: 3000,
  async fetch(request: Request) {
    let { pathname } = new URL(request.url);
    // Not sure if it's secure enough
    let file = Bun.file(resolve(import.meta.dir, "public", `.${pathname}`));
    if (await file.exists()) {
      return new Response(file);
    }

    return await createRequestHandler(
      build,
      Bun.env.NODE_ENV || "development"
    )(request);
  },
} satisfies Serve;
