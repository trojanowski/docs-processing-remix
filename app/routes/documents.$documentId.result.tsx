import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";

import { getDocumentResult } from "~/models/documents.server";

const ParamsSchema = z.object({
  documentId: z.string().uuid(),
});

export async function loader({ params }: LoaderFunctionArgs) {
  const parsedParams = ParamsSchema.safeParse(params);
  if (!parsedParams.success) {
    throw new Response("Incorrect document id", { status: 404 });
  }

  const result = await getDocumentResult(parsedParams.data.documentId);
  if (!result) {
    throw new Response("No document result found", { status: 404 });
  }

  return result;
}
