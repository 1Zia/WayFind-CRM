"use client";

import React, { useState, useRef } from "react";
import { Send, Smile, Paperclip, Loader2, X, File } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { ReplyPreview } from "./reply-preview";
import { toast } from "sonner";

type MessageComposerProps = {
  uploadReady: boolean;
  replyToMessage: { id: string; senderName: string | null; content: string } | null;
  onCancelReply: () => void;
  onSendMessage: (content: string, attachment: any | null) => Promise<boolean>;
};

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏", "✅", "🚀"];

const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export function MessageComposer({
  uploadReady,
  replyToMessage,
  onCancelReply,
  onSendMessage,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isUploading, startUpload } = useUploadThing("documentUploader");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const isAllowed = ACCEPTED_EXTENSIONS.includes(extension);

    if (!isAllowed) {
      toast.error(
        "Unsupported file type. Upload PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, or WEBP."
      );
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File is too large. Maximum upload size is 16MB.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setShowEmojiPicker(false);
  }

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (sending || isUploading) return;

    const trimmedContent = content.trim();
    if (!trimmedContent && !selectedFile) {
      return; // Cannot send empty message
    }

    setSending(true);
    let attachmentData = null;

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        const uploadResult = await startUpload([selectedFile]);
        const uploadedFile = uploadResult?.[0];

        if (!uploadedFile) {
          throw new Error("File upload failed. Please try again.");
        }

        attachmentData = {
          url: uploadedFile.ufsUrl || uploadedFile.url,
          name: uploadedFile.name || selectedFile.name,
          type: uploadedFile.type || selectedFile.type || "application/octet-stream",
          size: uploadedFile.size ?? selectedFile.size,
        };
      }

      // 2. Call parent message sender
      const success = await onSendMessage(trimmedContent, attachmentData);

      if (success) {
        setContent("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function insertEmoji(emoji: string) {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }

  const isButtonDisabled = (!content.trim() && !selectedFile) || sending || isUploading;

  return (
    <div className="border-t border-crm-border bg-crm-surface flex flex-col">
      {/* Reply Reference Preview */}
      <ReplyPreview message={replyToMessage} onClear={onCancelReply} />

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="flex items-center justify-between border-t border-crm-border bg-crm-body px-4 py-2 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <File className="h-4 w-4 text-crm-primary shrink-0" />
            <span className="truncate text-xs font-semibold text-crm-heading">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-full p-1 text-crm-danger hover:bg-crm-danger-soft transition-colors"
            title="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSend} className="relative flex items-end gap-2 p-3 bg-crm-surface">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={ACCEPTED_EXTENSIONS.join(",")}
          className="hidden"
        />

        {/* Attachment icon */}
        {uploadReady ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || isUploading}
            className="rounded-lg p-2 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors shrink-0 disabled:opacity-50"
            title="Add File Attachment"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="rounded-lg p-2 text-crm-muted/40 shrink-0 cursor-not-allowed"
            title="Uploads disabled (Add UPLOADTHING_TOKEN)"
          >
            <Paperclip className="h-5 w-5" />
          </button>
        )}

        {/* Emoji Picker Popover */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            disabled={sending || isUploading}
            className="rounded-lg p-2 text-crm-muted hover:bg-crm-body hover:text-crm-heading transition-colors disabled:opacity-50"
            title="Insert Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 z-20 mb-2 grid grid-cols-5 gap-1 rounded-xl border border-crm-border bg-crm-surface p-2 shadow-dropdown w-[180px] animate-in zoom-in duration-100">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="h-7 w-7 text-base hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending || isUploading}
            placeholder="Type your message..."
            className="w-full max-h-[120px] min-h-[38px] rounded-xl border border-crm-border bg-crm-body py-2 px-3 text-sm text-crm-heading outline-none placeholder:text-crm-muted focus:border-crm-primary/50 transition-colors resize-none disabled:opacity-60"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-crm-primary text-white hover:bg-crm-primary/90 disabled:bg-crm-primary-soft disabled:text-crm-primary/60 transition-all shrink-0"
        >
          {sending || isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4.5 w-4.5" />
          )}
        </button>
      </form>
    </div>
  );
}
