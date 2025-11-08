import { z } from "zod";
import { useState } from "react";

export const validateFormData = (
  schema: z.ZodSchema<any>,
  data: any,
): { isValid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formErrors: Record<string, string> = {};

      error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!formErrors[field]) {
          formErrors[field] = issue.message;
        }
      });

      return { isValid: false, errors: formErrors };
    }
    return { isValid: false, errors: {} };
  }
};

export const useSignUpFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (data: T): boolean => {
    const { isValid, errors: validationErrors } = validateFormData(
      schema,
      data,
    );
    setErrors(validationErrors);
    return isValid;
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearFieldError,
    clearAllErrors,
  };
};

export const useSignInFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (schema: z.ZodSchema<any>, data: any): boolean => {
    const { isValid, errors: validationErrors } = validateFormData(
      schema,
      data,
    );
    setErrors(validationErrors);
    return isValid;
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearFieldError,
    clearAllErrors,
  };
};
