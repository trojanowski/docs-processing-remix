// Partially inspired by
// https://github.com/epicweb-dev/epic-stack/blob/11defa5cdd787c8b07a4d103f0b1bd79accdfa83/app/routes/settings%2B/profile.photo.tsx

import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  type DataFunctionArgs,
  type MetaFunction,
  MaxPartSizeExceededError,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { createAndProcessDocument } from "~/models/documents.server";

const MAX_SIZE = 1024 * 1024 * 2; // 2 MB
const DOCUMENT_TOO_LARGE_MESSAGE = "Document size must be less than 2MB";

const UploadSchema = z.object({
  document: z
    .instanceof(File, { message: "Document not provided or is incorrect" })
    .refine((file) => file.size > 0, "Document is required")
    .refine((file) => file.size <= MAX_SIZE, DOCUMENT_TOO_LARGE_MESSAGE)
    .refine((file) => file.type === "text/csv", "Document must be a CSV file"),
});

export const meta: MetaFunction = () => {
  return [{ title: "Document processing with Remix | Upload" }];
};

export async function action({ request }: DataFunctionArgs) {
  let formData: FormData;

  try {
    formData = await unstable_parseMultipartFormData(
      request,
      unstable_createMemoryUploadHandler({ maxPartSize: MAX_SIZE })
    );
  } catch (error) {
    if (error instanceof MaxPartSizeExceededError) {
      return json(
        { submission: null, uploadTooLarge: true },
        {
          status: 413,
        }
      );
    }
    throw error;
  }

  const submission = parse(formData, {
    schema: UploadSchema,
  });

  if (submission.intent !== "submit" || !submission.value) {
    return json({ submission });
  }

  const file = submission.value.document;

  const document = await createAndProcessDocument({
    filename: file.name,
    content: await file.text(),
  });
  return redirect(`/documents/${document.id}`);
}

export default function Upload() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.formAction === "/upload";

  const [form, fields] = useForm({
    id: "profile-photo",
    constraint: getFieldsetConstraint(UploadSchema),
    lastSubmission: actionData?.submission ?? undefined,
    onValidate({ formData }) {
      return parse(formData, { schema: UploadSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const isUploadTooLarge = Boolean(
    actionData && "uploadTooLarge" in actionData && actionData.uploadTooLarge
  );

  return (
    <>
      <h1>Upload a document</h1>

      <Form method="POST" encType="multipart/form-data" {...form.props}>
        <fieldset>
          <label htmlFor={fields.document.id}>Document file</label>
          <input
            {...conform.input(fields.document, {
              type: "file",
            })}
            accept=".csv"
          />
          {fields.document.errors?.length ? (
            <>
              {fields.document.errors.map((error, index) => (
                <p key={index} style={{ color: "#e85600" }}>
                  {error}
                </p>
              ))}
            </>
          ) : null}
          {isUploadTooLarge ? (
            <p style={{ color: "#e85600" }}>{DOCUMENT_TOO_LARGE_MESSAGE}</p>
          ) : null}
        </fieldset>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading" : "Upload document"}
        </button>
      </Form>
    </>
  );
}
