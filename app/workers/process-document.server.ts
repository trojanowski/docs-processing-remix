import Papa from "papaparse";
import { z } from "zod";

import {
  getDocumentSourceContent,
  storeProcessingResult,
} from "~/models/documents.server";

const processDocumentSchema = z.object({
  documentId: z.string().uuid(),
});

export async function processDocument(payload: unknown) {
  const { documentId } = processDocumentSchema.parse(payload);

  const sourceContent = await getDocumentSourceContent(documentId);
  if (!sourceContent) {
    throw new Error(`Document source not found: ${documentId}`);
  }

  const parsedCsv = await parseCsvString(sourceContent);
  await storeProcessingResult(documentId, parsedCsv);
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
