import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/ui/button-loading";
import { PanelLoading } from "@/components/shared/LoadingState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSettings, useUpdateAdminSettings } from "@/features/admin/hooks";
import type { BankAccount } from "@/features/commerce/api";
import { AdminLayout, PageHeader } from "@/layouts/AdminLayout/AdminLayout";
import { describeApiError } from "@/lib/api/errors";

type EditableBankAccountField = "account_name" | "account_number" | "bank_name" | "currency";
type FieldErrors = Partial<Record<EditableBankAccountField, string>>;

const EMPTY_BANK_ACCOUNT: BankAccount = {
  account_name: "",
  account_number: "",
  bank_name: "",
  currency: "",
  payment_instruction: "",
};

export function AdminSettingsPage() {
  const settings = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const [bankAccount, setBankAccount] = useState<BankAccount>(EMPTY_BANK_ACCOUNT);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (settings.data?.bank_account) {
      setBankAccount(settings.data.bank_account);
      setErrors({});
    }
  }, [settings.data]);

  const setField = (field: EditableBankAccountField) => (value: string) => {
    setBankAccount((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateBankAccount(bankAccount);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateSettings.mutate(
      {
        bank_account: {
          account_name: bankAccount.account_name.trim(),
          account_number: bankAccount.account_number.trim(),
          bank_name: bankAccount.bank_name.trim(),
          currency: bankAccount.currency.trim(),
        },
      },
      {
        onSuccess: () => toast.success("Settings updated successfully."),
        onError: (error) => toast.error(describeApiError(error, "Settings could not be updated.")),
      },
    );
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Settings"
        description="Manage platform settings and payment information."
      />

      <section className="max-w-4xl border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Bank Account</h2>
        </header>

        {settings.isLoading ? (
          <PanelLoading message="Loading settings..." />
        ) : settings.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-foreground">Settings could not be loaded</p>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {describeApiError(settings.error, "Please try again in a moment.")}
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="bank-name">Bank name</Label>
                <Input
                  id="bank-name"
                  value={bankAccount.bank_name}
                  onChange={(event) => setField("bank_name")(event.target.value)}
                />
                <FieldError message={errors.bank_name} />
              </div>

              <div>
                <Label htmlFor="account-name">Account name</Label>
                <Input
                  id="account-name"
                  value={bankAccount.account_name}
                  onChange={(event) => setField("account_name")(event.target.value)}
                />
                <FieldError message={errors.account_name} />
              </div>

              <div>
                <Label htmlFor="account-number">Account number</Label>
                <Input
                  id="account-number"
                  inputMode="text"
                  value={bankAccount.account_number}
                  onChange={(event) => setField("account_number")(event.target.value)}
                />
                <FieldError message={errors.account_number} />
              </div>

              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={bankAccount.currency}
                  onChange={(event) => setField("currency")(event.target.value)}
                />
                <FieldError message={errors.currency} />
              </div>
            </div>

            <footer className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
              <Button
                type="submit"
                disabled={updateSettings.isPending}
                aria-busy={updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <ButtonLoading>Saving...</ButtonLoading>
                ) : (
                  "Save changes"
                )}
              </Button>
            </footer>
          </form>
        )}
      </section>
    </AdminLayout>
  );
}

function validateBankAccount(bankAccount: BankAccount): FieldErrors {
  const errors: FieldErrors = {};
  if (!bankAccount.bank_name.trim()) errors.bank_name = "Bank name is required.";
  if (!bankAccount.account_name.trim()) errors.account_name = "Account name is required.";
  if (!bankAccount.account_number.trim()) errors.account_number = "Account number is required.";
  if (!bankAccount.currency.trim()) errors.currency = "Currency is required.";
  return errors;
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
