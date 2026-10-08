import { useState } from "react";
import {
  initialWithdrawalForm,
  validateWithdrawalForm,
  toWithdrawalInput,
  type WithdrawalFormValues,
} from "@/features/withdrawal/withdrawal-form";

export const useWithdrawalForm = () => {
  const [form, setForm] = useState(initialWithdrawalForm);
  const [validationError, setValidationError] = useState<string | null>(null);
  const setField = (field: keyof WithdrawalFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const validate = () => {
    const error = validateWithdrawalForm(form);
    setValidationError(error);
    return error ? null : toWithdrawalInput(form);
  };
  return {
    form,
    setField,
    validationError,
    validate,
    isFormReady: validateWithdrawalForm(form) === null,
  };
};
