import { createHash } from "node:crypto";

import { desc, eq } from "drizzle-orm";

import { db } from "~/db/drizzle.server";
import {
  documents,
  documentResults,
  documentSources,
} from "~/db/schema.server";
import { addJob } from "./utils.server";

type CreateDocumentInput = {
  content: string;
  filename: string;
};

export async function listDocuments() {
  return await db.query.documents.findMany({
    columns: {
      id: true,
      filename: true,
      createdAt: true,
      processedAt: true,
    },
    orderBy: [desc(documents.createdAt), desc(documents.id)],
  });
}

export async function getDocument(id: string) {
  return await db.query.documents.findFirst({
    where: eq(documents.id, id),
    columns: {
      id: true,
      filename: true,
      createdAt: true,
      processedAt: true,
      processingError: true,
      inputHash: true,
    },
  });
}

export async function getDocumentResult(documentId: string) {
  const resultRow = await db.query.documentResults.findFirst({
    where: eq(documentResults.documentId, documentId),
    columns: {
      result: true,
    },
  });

  return resultRow?.result;
}

export async function createAndProcessDocument(input: CreateDocumentInput) {
  return await db.transaction(async (tx) => {
    const document = (
      await tx
        .insert(documents)
        .values({
          filename: input.filename,
          inputHash: generateHash(input.content),
          // TODO: delete it from here after using a background job
          processedAt: new Date(),
        })
        .returning()
    )[0];

    await tx.insert(documentSources).values({
      content: input.content,
      documentId: document.id,
    });

    await addJob(tx, "processDocument", { documentId: document.id });

    return document;
  });
}

export async function getDocumentSourceContent(documentId: string) {
  const source = await db.query.documentSources.findFirst({
    where: eq(documentSources.documentId, documentId),
    columns: {
      content: true,
    },
  });

  return source?.content;
}

export async function storeProcessingResult(
  documentId: string,
  result: unknown
) {
  await db.transaction(async (tx) => {
    await tx.insert(documentResults).values({
      documentId: documentId,
      result: result,
    });

    await tx
      .update(documents)
      .set({
        processedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
  });
}

function generateHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
