import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { requireUser } from "@/lib/auth";

const f = createUploadthing();

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
  "webp",
]);

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export const uploadRouter = {
  documentUploader: f({
    blob: {
      maxFileCount: 1,
      maxFileSize: "16MB",
    },
  })
    .middleware(async ({ files }) => {
      const user = await requireUser();
      const file = files[0];

      if (!file) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Please select a document to upload.",
        });
      }

      if (!allowedExtensions.has(getExtension(file.name))) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message:
            "Unsupported file type. Upload PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or WEBP files.",
        });
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      return {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || getExtension(file.name) || "application/octet-stream",
        fileUrl: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
