import { createHash } from "node:crypto";

import { desc, eq } from "drizzle-orm";
import Papa from "papaparse";

import { db } from "~/db/drizzle.server";
import {
  documents,
  documentResults,
  documentSources,
} from "~/db/schema.server";

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
  // TODO: process the document in a background job
  const parsedCsv = await parseCsvString(input.content);

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

    await tx.insert(documentResults).values({
      documentId: document.id,
      result: parsedCsv,
    });

    return document;
  });
}

function generateHash(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function parseCsvString(csvString: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: unknown) => {
        reject(error);
      },
    });
  });
}
