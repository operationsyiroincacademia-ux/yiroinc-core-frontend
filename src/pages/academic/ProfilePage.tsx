import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/layouts/UserLayout/AppShell";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";
import {
  LEVEL_OPTIONS,
  examLevelLabel,
  normalizeExamLevel,
  type ExamType,
} from "@/features/exam/options";
import { useDeleteAccount, useProfile, useUpdateProfile } from "@/features/profile/hooks";
import type { UpdateProfileInput } from "@/features/profile/api";
import { EXPERIENCE_LABEL, PROFILE_TYPE_LABEL, type ProfileType } from "@/lib/roles";
import { useAuth } from "@/lib/auth/auth-context";
import { useCurrentUser } from "@/lib/auth/current-user";

type Editable = {
  phone: string;
  organizationName: string;
  examLevel: string;
  institution: string;
  areaOfInterest: string;
  country: string;
};

type Errors = Partial<Record<keyof Editable, string>>;

const EMPTY_FORM: Editable = {
  phone: "",
  organizationName: "",
  examLevel: "",
  institution: "",
  areaOfInterest: "",
  country: "",
};

const SELECT_CLASS =
  "mt-2 h-11 w-full border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60";
const DELETE_CONFIRMATION = "DELETE";
const CUSTOMER_PROFILE_TYPES = new Set<ProfileType>([
  "academic_user",
  "cfa_candidate",
  "frm_candidate",
  "corporate_client",
]);

function valueOf(value: string | null | undefined): string {
  return value ?? "";
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function ProfilePage() {
  const [form, setForm] = useState<Editable>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearSession } = useAuth();
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  // Profile type comes from the active account context, not from the page.
  const user = useCurrentUser();
  const profileTypeLabel = user.profileType
    ? PROFILE_TYPE_LABEL[user.profileType]
    : EXPERIENCE_LABEL[user.experience];
  const profileMode =
    user.profileType === "corporate_client"
      ? "corporate"
      : user.profileType === "cfa_candidate"
        ? "cfa"
        : user.profileType === "frm_candidate"
          ? "frm"
          : "academic";
  const candidateExam: ExamType | null =
    profileMode === "cfa" ? "CFA" : profileMode === "frm" ? "FRM" : null;
  const showsInstitution = profileMode === "academic" || candidateExam !== null;
  const showsOrganization = profileMode === "corporate";
  const levelOptions = candidateExam ? LEVEL_OPTIONS[candidateExam] : [];
  const levelLabel = candidateExam === "FRM" ? "Part" : "Level";
  const levelPlaceholder = candidateExam === "FRM" ? "Select part" : "Select level";
  const canDeleteAccount =
    !user.isAdmin && user.profileType !== null && CUSTOMER_PROFILE_TYPES.has(user.profileType);
  const deleteConfirmed = deleteConfirmation.trim() === DELETE_CONFIRMATION;

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      phone: valueOf(profile.phone),
      organizationName: valueOf(profile.organization_name),
      examLevel: candidateExam ? normalizeExamLevel(profile.exam_level, candidateExam) : "",
      institution: valueOf(profile.institution),
      areaOfInterest: valueOf(profile.area_of_interest),
      country: valueOf(profile.country),
    });
  }, [candidateExam, profileQuery.data]);

  const set = (key: keyof Editable) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
    setSaveError(null);
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (form.phone.trim() && !/^[+0-9][0-9\s()-]{6,}$/.test(form.phone.trim())) {
      next.phone = "Enter a valid phone number.";
    }
    if (
      candidateExam &&
      form.examLevel &&
      !levelOptions.some((option) => option.value === form.examLevel)
    ) {
      next.examLevel = `Select a valid ${levelLabel.toLowerCase()}.`;
    }
    return next;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("error");
      setSaveError(null);
      return;
    }

    const payload: UpdateProfileInput = {
      phone: nullable(form.phone),
      area_of_interest: nullable(form.areaOfInterest),
      country: nullable(form.country),
    };
    if (showsInstitution) payload.institution = nullable(form.institution);
    if (candidateExam) payload.exam_level = nullable(form.examLevel);

    try {
      setStatus("idle");
      setSaveError(null);
      await updateProfile.mutateAsync(payload);
      toast.success("Profile updated successfully.");
    } catch (error) {
      setStatus("error");
      setSaveError(describeApiError(error, "Your profile could not be updated."));
    }
  };

  const onDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open && !deleteAccount.isPending) {
      setDeleteConfirmation("");
      setDeleteError(null);
    }
  };

  const onDeleteAccount = async () => {
    if (!deleteConfirmed || deleteAccount.isPending) return;

    try {
      setDeleteError(null);
      await deleteAccount.mutateAsync({ confirmation: DELETE_CONFIRMATION });
      queryClient.clear();
      clearSession();
      toast.success("Account deleted successfully.");
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      setDeleteError(accountDeletionError(error));
      toast.error(accountDeletionError(error));
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Profile"
        description="Your account details and the information we use to contact you."
      />

      {profileQuery.isLoading ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        </section>
      ) : profileQuery.isError || !profileQuery.data ? (
        <section className="border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Profile could not be loaded</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {describeApiError(profileQuery.error, "Please try again in a moment.")}
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
          <form onSubmit={onSubmit} noValidate className="border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Personal details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Update the fields below and save your changes.
              </p>
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2.5 border-b border-border bg-danger-soft px-5 py-3.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" strokeWidth={2} />
                <p className="text-sm text-danger">
                  {saveError ?? "Some details need attention. Review the highlighted fields below."}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <ReadOnlyValue
                label="Name"
                value={user.displayName}
                hint="Your name comes from your account identity."
              />
              <ReadOnlyValue
                label="Email address"
                value={user.email}
                hint="Your email address is used to sign in and cannot be changed here."
              />
              {candidateExam ? (
                <ReadOnlyValue
                  label="Exam"
                  value={candidateExam}
                  hint="Set by your account type."
                />
              ) : null}
              <Field
                id="phone"
                label="Phone number"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                error={errors.phone}
              />
              {showsInstitution ? (
                <Field
                  id="institution"
                  label="Institution"
                  value={form.institution}
                  onChange={set("institution")}
                  hint="Optional"
                />
              ) : null}
              {showsOrganization ? (
                <ReadOnlyValue
                  label="Organization name"
                  value={form.organizationName}
                  hint="Set during Corporate account registration."
                />
              ) : null}
              {candidateExam ? (
                <SelectField
                  id="examLevel"
                  label={levelLabel}
                  value={form.examLevel}
                  onChange={set("examLevel")}
                  options={levelOptions}
                  placeholder={levelPlaceholder}
                  error={errors.examLevel}
                  hint="Optional"
                />
              ) : null}
              <Field
                id="areaOfInterest"
                label="Area of interest"
                value={form.areaOfInterest}
                onChange={set("areaOfInterest")}
                hint="Optional"
              />
              <Field
                id="country"
                label="Country"
                value={form.country}
                onChange={set("country")}
                hint="Optional"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                aria-busy={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <ButtonLoading>Saving...</ButtonLoading>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>

          <aside className="border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-bold tracking-tight text-foreground">Account</h2>
            </div>
            <dl className="px-5 py-5">
              <div>
                <dt className="text-xs text-muted-foreground">Full name</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {user.displayName || "—"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Email address</dt>
                <dd className="mt-1 break-words text-sm font-medium text-foreground">
                  {user.email || "—"}
                </dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Phone number</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{form.phone || "—"}</dd>
              </div>
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Profile type</dt>
                <dd className="mt-1.5">
                  <StatusBadge label={profileTypeLabel} tone="info" />
                </dd>
              </div>
              {candidateExam ? (
                <>
                  <div className="mt-4">
                    <dt className="text-xs text-muted-foreground">Exam</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">{candidateExam}</dd>
                  </div>
                  <div className="mt-4">
                    <dt className="text-xs text-muted-foreground">{levelLabel}</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {form.examLevel ? examLevelLabel(form.examLevel) : "Not provided"}
                    </dd>
                  </div>
                </>
              ) : null}
              {showsOrganization ? (
                <div className="mt-4">
                  <dt className="text-xs text-muted-foreground">Organization name</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {form.organizationName || "Not provided"}
                  </dd>
                </div>
              ) : null}
              {showsInstitution ? (
                <div className="mt-4">
                  <dt className="text-xs text-muted-foreground">Institution</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {form.institution || "Not provided"}
                  </dd>
                </div>
              ) : null}
              <div className="mt-4">
                <dt className="text-xs text-muted-foreground">Country</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {form.country || "Not provided"}
                </dd>
              </div>
            </dl>
          </aside>
          {canDeleteAccount ? (
            <DeleteAccountSection
              open={deleteDialogOpen}
              confirmation={deleteConfirmation}
              error={deleteError}
              pending={deleteAccount.isPending}
              confirmed={deleteConfirmed}
              onOpenChange={onDeleteDialogOpenChange}
              onConfirmationChange={(value) => {
                setDeleteConfirmation(value);
                setDeleteError(null);
              }}
              onDelete={onDeleteAccount}
            />
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

function accountDeletionError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return "Your account cannot be deleted while you have active requests, orders, or payments.";
    }
    if (error.status === 422) {
      return "Type DELETE to confirm before deleting your account.";
    }
  }
  return describeApiError(error, "Your account could not be deleted. Please try again.");
}

function DeleteAccountSection({
  open,
  confirmation,
  error,
  pending,
  confirmed,
  onOpenChange,
  onConfirmationChange,
  onDelete,
}: {
  open: boolean;
  confirmation: string;
  error: string | null;
  pending: boolean;
  confirmed: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmationChange: (value: string) => void;
  onDelete: () => void;
}) {
  return (
    <section className="border border-border bg-card lg:col-span-2">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold tracking-tight text-foreground">Delete account</h2>
      </div>
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Permanently close your YiroInc Academia account. Your active access will be removed and
            you will be signed out.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            We may keep necessary order, payment, and business records for our history and
            operations.
          </p>
        </div>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="self-start"
            onClick={() => onOpenChange(true)}
          >
            Delete account
          </Button>
          <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription>
                This permanently closes your current account. You will immediately lose access, and
                this action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you return later, you may create a new account, but previous orders, purchases,
                resources, and history will not move to the new account.
              </p>
              <div>
                <Label htmlFor="delete-account-confirmation">Type DELETE to confirm</Label>
                <Input
                  id="delete-account-confirmation"
                  value={confirmation}
                  onChange={(event) => onConfirmationChange(event.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "delete-account-error" : undefined}
                  autoComplete="off"
                  className={error ? "mt-2 h-11 border-danger" : "mt-2 h-11"}
                />
                {error ? (
                  <p id="delete-account-error" role="alert" className="mt-2 text-sm text-danger">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={pending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                disabled={!confirmed || pending}
                aria-busy={pending}
                onClick={onDelete}
              >
                {pending ? <ButtonLoading>Deleting...</ButtonLoading> : "Delete account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  readOnly = false,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "mt-2 h-11 border-danger" : "mt-2 h-11"}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  placeholder: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? `${SELECT_CLASS} border-danger` : SELECT_CLASS}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function ReadOnlyValue({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div
        tabIndex={0}
        className="mt-2 min-h-11 border border-border bg-muted px-3 py-3 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
      >
        {value || "-"}
      </div>
      {hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
