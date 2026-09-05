import { useEffect, useRef, useState } from "react";
import { AlertCircle, Eye, FileText, ImageIcon, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { fetchSupportAttachmentBlob, type SupportAttachment } from "@/features/support/api";
import { attachmentDownloadUrl, attachmentName } from "@/features/support/format";
import { cn } from "@/lib/utils";

type AttachmentKind = "image" | "pdf" | "unknown";

const PDF_OBJECT_URL_TTL_MS = 60_000;
const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function SupportAttachmentPreview({ attachment }: { attachment: SupportAttachment }) {
  const kind = supportAttachmentKind(attachment);

  if (kind === "image") {
    return <ImageAttachmentPreview attachment={attachment} />;
  }

  return <FileAttachmentPreview attachment={attachment} kind={kind} />;
}

function ImageAttachmentPreview({ attachment }: { attachment: SupportAttachment }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<
    "fetching" | "loading-image" | "ready" | "fetch-error" | "decode-error"
  >("fetching");
  const [open, setOpen] = useState(false);
  const filename = attachmentName(attachment);
  const sourceUrl = attachmentDownloadUrl(attachment);
  const expectedMimeType = expectedImageMimeType(attachment);

  useEffect(() => {
    let cancelled = false;
    let nextObjectUrl: string | null = null;

    setObjectUrl(null);

    if (!sourceUrl) {
      setLoadState("fetch-error");
      return undefined;
    }

    setLoadState("fetching");
    fetchSupportAttachmentBlob(sourceUrl)
      .then((blob) => {
        if (cancelled) return;

        if (blob.size === 0) {
          setLoadState("fetch-error");
          return;
        }

        const viewableBlob =
          isImageMimeType(blob.type) || !expectedMimeType
            ? blob
            : blob.slice(0, blob.size, expectedMimeType);

        nextObjectUrl = URL.createObjectURL(viewableBlob);
        setObjectUrl(nextObjectUrl);
        setLoadState("loading-image");
      })
      .catch(() => {
        if (!cancelled) setLoadState("fetch-error");
      });

    return () => {
      cancelled = true;
      if (nextObjectUrl) URL.revokeObjectURL(nextObjectUrl);
    };
  }, [expectedMimeType, sourceUrl]);

  if (loadState === "fetching" || loadState === "loading-image") {
    return (
      <div className="inline-flex max-w-32 flex-col border border-border bg-background p-2 sm:max-w-36">
        <div className="flex size-28 items-center justify-center bg-muted text-muted-foreground sm:size-32">
          <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
        </div>
        <p className="mt-2 max-w-28 truncate text-xs text-muted-foreground sm:max-w-32">
          {filename}
        </p>
      </div>
    );
  }

  if (loadState === "fetch-error" || loadState === "decode-error" || !objectUrl) {
    return <UnavailableAttachment filename={filename} />;
  }

  return (
    <>
      <button
        type="button"
        className="group inline-flex max-w-32 flex-col border border-border bg-background p-2 text-left transition-colors hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:max-w-36"
        onClick={() => setOpen(true)}
      >
        <span className="block size-28 overflow-hidden bg-muted sm:size-32">
          <img
            src={objectUrl}
            alt={filename}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            onLoad={() => setLoadState("ready")}
            onError={() => setLoadState("decode-error")}
          />
        </span>
        <span className="mt-2 flex max-w-28 min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:max-w-32">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span className="truncate">{filename}</span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-5xl border-border bg-background p-3 sm:p-4">
          <DialogTitle className="sr-only">{filename}</DialogTitle>
          <DialogDescription className="sr-only">
            Full-size support attachment preview.
          </DialogDescription>
          <div className="flex max-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-muted">
            <img
              src={objectUrl}
              alt={filename}
              className="max-h-[calc(100vh-5rem)] max-w-full object-contain"
            />
          </div>
          <p className="truncate px-1 text-xs text-muted-foreground">{filename}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FileAttachmentPreview({
  attachment,
  kind,
}: {
  attachment: SupportAttachment;
  kind: AttachmentKind;
}) {
  const [viewState, setViewState] = useState<"idle" | "loading" | "error">("idle");
  const cleanupTimers = useRef<number[]>([]);
  const filename = attachmentName(attachment);
  const sourceUrl = attachmentDownloadUrl(attachment);
  const isPdf = kind === "pdf";

  useEffect(
    () => () => {
      cleanupTimers.current.forEach((timerId) => window.clearTimeout(timerId));
      cleanupTimers.current = [];
    },
    [],
  );

  const viewAttachment = async () => {
    if (!sourceUrl || !isPdf) {
      setViewState("error");
      return;
    }

    setViewState("loading");
    const viewer = window.open("", "_blank");
    if (viewer) {
      viewer.opener = null;
    }

    try {
      const blob = await fetchSupportAttachmentBlob(sourceUrl);
      const pdfBlob =
        blob.type === "application/pdf" ? blob : blob.slice(0, blob.size, "application/pdf");
      const objectUrl = URL.createObjectURL(pdfBlob);

      if (viewer) {
        viewer.location.href = objectUrl;
      } else {
        window.open(objectUrl, "_blank", "noopener,noreferrer");
      }

      const timerId = window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        cleanupTimers.current = cleanupTimers.current.filter((item) => item !== timerId);
      }, PDF_OBJECT_URL_TTL_MS);
      cleanupTimers.current.push(timerId);
      setViewState("idle");
    } catch {
      if (viewer) viewer.close();
      setViewState("error");
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-3 py-2.5",
        !isPdf && "text-muted-foreground",
      )}
    >
      <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground">
        {isPdf ? (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        )}
        <span className="truncate">{filename}</span>
      </span>
      {isPdf ? (
        <Button
          variant="outline"
          size="sm"
          disabled={!sourceUrl || viewState === "loading"}
          onClick={viewAttachment}
        >
          {viewState === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={2} />
          )}
          View
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">Unavailable</span>
      )}
      {viewState === "error" && (
        <p className="basis-full text-xs text-danger">This attachment could not be opened.</p>
      )}
    </div>
  );
}

function UnavailableAttachment({ filename }: { filename: string }) {
  return (
    <div className="w-full max-w-64 border border-border bg-background p-3">
      <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground">
        <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2} />
        <span className="truncate">{filename}</span>
      </span>
      <p className="mt-2 text-xs text-danger">This preview is unavailable.</p>
    </div>
  );
}

function supportAttachmentKind(attachment: SupportAttachment): AttachmentKind {
  const mimeType = String(attachment.mime_type ?? "").toLowerCase();
  const filename = attachmentName(attachment).toLowerCase();

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    /\.(jpe?g|png|webp)$/.test(filename)
  ) {
    return "image";
  }

  if (mimeType === "application/pdf" || filename.endsWith(".pdf")) {
    return "pdf";
  }

  return "unknown";
}

function expectedImageMimeType(attachment: SupportAttachment) {
  const mimeType = String(attachment.mime_type ?? "").toLowerCase();
  if (isImageMimeType(mimeType)) return mimeType;

  const filename = attachmentName(attachment).toLowerCase();
  if (/\.(jpe?g)$/.test(filename)) return "image/jpeg";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";

  return null;
}

function isImageMimeType(value: string) {
  return IMAGE_MIME_TYPES.includes(value.toLowerCase());
}
