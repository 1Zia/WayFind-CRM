"use client";

import { DocumentForm } from "@/components/documents/document-form";

type Option = {
  id: string;
  name: string;
};

type DocumentUploaderProps = {
  clients?: Option[];
  projects?: Option[];
  uploadReady?: boolean;
};

export function DocumentUploader(props: DocumentUploaderProps) {
  return <DocumentForm {...props} />;
}
