import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminResourceInput } from "@/features/admin/api";
import { useUploadAdminResourceFile } from "@/features/admin/hooks";
import { formatMoney, toFlag, toNumber } from "@/features/commerce/format";
import type { Resource, ResourceAudience } from "@/features/resources/api";
import { describeApiError } from "@/lib/api/errors";

const SELECT_CLASS =
  "h-11 w-full border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";

type ExamType = "CFA" | "FRM";
type ExamLevel = "level_1" | "level_2" | "level_3" | "part_1" | "part_2";
type Pricing = "free" | "paid";
type SourceType = "file" | "external";

type FormState = {
  title: string;
  description: string;
  category: string;
  audiences: ResourceAudience[];
  examType: ExamType;
  examLevel: ExamLevel;
  pricing: Pricing;
  price: string;
  isPublic: "public" | "private";
  sourceType: SourceType;
  externalUrl: string;
};

type Errors = Partial<Record<keyof FormState | "file", string>>;

const LEVEL_OPTIONS: Record<ExamType, { label: string; value: ExamLevel }[]> = {
  CFA: [
    { label: "Level I", value: "level_1" },
    { label: "Level II", value: "level_2" },
    { label: "Level III", value: "level_3" },
  ],
  FRM: [
    { label: "Part I", value: "part_1" },
    { label: "Part II", value: "part_2" },
  ],
};

const AUDIENCE_OPTIONS: { label: string; value: ResourceAudience }[] = [
  { label: "Academic Users", value: "academic" },
  { label: "Exam Candidates", value: "exam_candidate" },
  { label: "Corporate Users", value: "corporate" },
];

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "",
  audiences: [],
  examType: "CFA",
  examLevel: "level_1",
  pricing: "free",
  price: "",
  isPublic: "public",
  sourceType: "external",
  externalUrl: "",
};

export function AdminResourceForm({
  resource,
  submitLabel,
  isPending,
  error,
  onSubmit,
}: {
  resource?: Resource | null;
  submitLabel: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (input: AdminResourceInput) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() => formFromResource(resource));
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const uploadFile = useUploadAdminResourceFile();

  useEffect(() => {
    setForm(formFromResource(resource));
    setFile(null);
    setErrors({});
  }, [resource]);

  const levelOptions = LEVEL_OPTIONS[form.examType];
  const hasExamCandidateAudience = form.audiences.includes("exam_candidate");
  const currentFileLabel = useMemo(() => currentFile(resource), [resource]);

  const set = (key: keyof FormState) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const setExamType = (examType: ExamType) => {
    setForm((current) => ({
      ...current,
      examType,
      examLevel: LEVEL_OPTIONS[examType][0].value,
    }));
    setErrors((current) => ({ ...current, examType: undefined, examLevel: undefined }));
  };

  const toggleAudience = (audience: ResourceAudience) => {
    setForm((current) => {
      const selected = current.audiences.includes(audience);
      return {
        ...current,
        audiences: selected
          ? current.audiences.filter((item) => item !== audience)
          : [...current.audiences, audience],
      };
    });
    setErrors((current) => ({
      ...current,
      audiences: undefined,
      examType: undefined,
      examLevel: undefined,
    }));
  };

  const setSourceType = (sourceType: SourceType) => {
    setForm((current) => ({ ...current, sourceType, externalUrl: "" }));
    setFile(null);
    setErrors((current) => ({
      ...current,
      sourceType: undefined,
      externalUrl: undefined,
      file: undefined,
    }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.category.trim()) next.category = "Category is required.";
    if (form.audiences.length === 0) next.audiences = "Select at least one audience.";
    if (
      hasExamCandidateAudience &&
      !levelOptions.some((option) => option.value === form.examLevel)
    ) {
      next.examLevel = "Select a valid level or part.";
    }
    if (form.pricing === "paid" && toNumber(form.price) <= 0) {
      next.price = "Enter a price greater than 0.";
    }
    if (form.sourceType === "external" && !validUrl(form.externalUrl)) {
      next.externalUrl = "Enter a valid external URL.";
    }
    if (form.sourceType === "file" && !file && !resource?.file_id) {
      next.file = "Upload a resource file.";
    }
    return next;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    let fileId: string | number | null =
      form.sourceType === "file" ? (resource?.file_id ?? null) : null;
    if (form.sourceType === "file" && file) {
      const uploaded = await uploadFile.mutateAsync({
        resourceId: resource?.id ?? 0,
        file,
      });
      fileId = uploaded.file_id;
    }

    await onSubmit({
      title: form.title.trim(),
      description: optional(form.description),
      category: optional(form.category),
      audiences: form.audiences,
      exam_type: hasExamCandidateAudience ? form.examType : null,
      exam_level: hasExamCandidateAudience ? form.examLevel : null,
      price: form.pricing === "free" ? 0 : toNumber(form.price),
      currency: "NGN",
      is_public: form.isPublic === "public",
      source_type: form.sourceType,
      file_id: form.sourceType === "file" ? fileId : null,
      external_url: form.sourceType === "external" ? form.externalUrl.trim() : null,
    });
  };

  const pending = isPending || uploadFile.isPending;

  return (
    <form onSubmit={submit} className="max-w-4xl">
      {error || uploadFile.error ? (
        <div className="mb-6 bg-danger-soft px-5 py-4 text-sm text-danger">
          {describeApiError(error ?? uploadFile.error, "Resource could not be saved.")}
        </div>
      ) : null}

      <section className="border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Resource information</h2>
        </header>

        <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => set("title")(event.target.value)}
            />
            <FieldError message={errors.title} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(event) => set("description")(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={form.category}
              onChange={(event) => set("category")(event.target.value)}
            />
            <FieldError message={errors.category} />
          </div>

          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <select
              id="visibility"
              className={SELECT_CLASS}
              value={form.isPublic}
              onChange={(event) => set("isPublic")(event.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>Available to</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {AUDIENCE_OPTIONS.map((audience) => (
                <label
                  key={audience.value}
                  className="flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={form.audiences.includes(audience.value)}
                    onChange={() => toggleAudience(audience.value)}
                  />
                  {audience.label}
                </label>
              ))}
            </div>
            <FieldError message={errors.audiences} />
          </div>

          {hasExamCandidateAudience ? (
            <>
              <div>
                <Label htmlFor="exam-type">Exam</Label>
                <select
                  id="exam-type"
                  className={SELECT_CLASS}
                  value={form.examType}
                  onChange={(event) => setExamType(event.target.value as ExamType)}
                >
                  <option value="CFA">CFA</option>
                  <option value="FRM">FRM</option>
                </select>
              </div>

              <div>
                <Label htmlFor="exam-level">{form.examType === "CFA" ? "Level" : "Part"}</Label>
                <select
                  id="exam-level"
                  className={SELECT_CLASS}
                  value={form.examLevel}
                  onChange={(event) => set("examLevel")(event.target.value)}
                >
                  {levelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.examLevel} />
              </div>
            </>
          ) : null}

          <div>
            <Label htmlFor="pricing">Pricing</Label>
            <select
              id="pricing"
              className={SELECT_CLASS}
              value={form.pricing}
              onChange={(event) => set("pricing")(event.target.value)}
            >
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={form.pricing === "free" ? "" : form.price}
              placeholder={form.pricing === "free" ? "Free" : formatMoney(0, "NGN")}
              disabled={form.pricing === "free"}
              onChange={(event) => set("price")(event.target.value)}
            />
            <FieldError message={errors.price} />
          </div>

          <div>
            <Label htmlFor="source-type">Source type</Label>
            <select
              id="source-type"
              className={SELECT_CLASS}
              value={form.sourceType}
              onChange={(event) => setSourceType(event.target.value as SourceType)}
            >
              <option value="file">File</option>
              <option value="external">External</option>
            </select>
          </div>

          {form.sourceType === "external" ? (
            <div>
              <Label htmlFor="external-url">External URL</Label>
              <Input
                id="external-url"
                type="url"
                value={form.externalUrl}
                placeholder="https://example.com/resource"
                onChange={(event) => set("externalUrl")(event.target.value)}
              />
              <FieldError message={errors.externalUrl} />
            </div>
          ) : (
            <div>
              <Label htmlFor="resource-file">Resource file</Label>
              <Input
                id="resource-file"
                type="file"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setErrors((current) => ({ ...current, file: undefined }));
                }}
              />
              {currentFileLabel && !file ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Current file: {currentFileLabel}
                </p>
              ) : null}
              {file ? (
                <p className="mt-1.5 text-xs text-muted-foreground">Selected: {file.name}</p>
              ) : null}
              <FieldError message={errors.file} />
            </div>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </footer>
      </section>
    </form>
  );
}

function formFromResource(resource?: Resource | null): FormState {
  if (!resource) return EMPTY_FORM;
  const examType = resource.exam_type === "FRM" ? "FRM" : "CFA";
  const fallbackLevel = LEVEL_OPTIONS[examType][0].value;
  const allowed = LEVEL_OPTIONS[examType].some((option) => option.value === resource.exam_level);
  const price = toNumber(resource.price);
  return {
    title: resource.title ?? "",
    description: resource.description ?? "",
    category: resource.category ?? "",
    audiences: normalizeAudiences(resource.audiences),
    examType,
    examLevel: allowed ? (resource.exam_level as ExamLevel) : fallbackLevel,
    pricing: price > 0 ? "paid" : "free",
    price: price > 0 ? String(price) : "",
    isPublic: toFlag(resource.is_public) ? "public" : "private",
    sourceType: resource.source_type === "file" ? "file" : "external",
    externalUrl: resource.external_url ?? "",
  };
}

function normalizeAudiences(value: Resource["audiences"]): ResourceAudience[] {
  return (Array.isArray(value) ? value : []).filter(
    (audience): audience is ResourceAudience =>
      audience === "academic" || audience === "exam_candidate" || audience === "corporate",
  );
}

function currentFile(resource?: Resource | null) {
  if (!resource?.file_id) return "";
  const name = resource.file_name || `File #${resource.file_id}`;
  const details = [
    resource.mime_type || resource.file_format,
    formatBytes(resource.file_size),
  ].filter(Boolean);
  return details.length > 0 ? `${name} (${details.join(", ")})` : name;
}

function formatBytes(value: string | number | null | undefined) {
  const size = toNumber(value);
  if (size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function optional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
