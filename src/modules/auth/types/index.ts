import {
  emailSchema,
  signUpSchema,
  usernameSchema,
} from "@/modules/auth/schemas";
import { z } from "zod";

export type UsernameFormData = z.infer<typeof usernameSchema>;
export type EmailFormData = z.infer<typeof emailSchema>;

export type LoginFormData = UsernameFormData & EmailFormData;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export enum ClerkErrorCodes {
  IDENTIFIER_NOT_FOUND = "form_identifier_not_found",
  PASSWORD_INCORRECT = "form_password_incorrect",
  TOO_MANY_REQUESTS = "too_many_requests",
  IDENTIFIER_EXISTS = "form_identifier_exists",
  INVALID_CREDENTIALS = "form_invalid_credentials",
  SESSION_EXISTS = "session_exists",
}

export const getClerkErrorMessage = (
  error: any,
  selectedTab: string,
): string => {
  if (!error?.errors || !Array.isArray(error.errors)) {
    return error?.message || "An unexpected error occurred. Please try again.";
  }

  const firstError = error.errors[0];

  switch (firstError?.code) {
    case ClerkErrorCodes.IDENTIFIER_NOT_FOUND:
      return `No account found with this ${selectedTab}. Please check your ${selectedTab} or register for a new account.`;

    case ClerkErrorCodes.PASSWORD_INCORRECT:
      return "Incorrect password. Please try again.";

    case ClerkErrorCodes.TOO_MANY_REQUESTS:
      return "Too many login attempts. Please wait a moment before trying again.";

    case ClerkErrorCodes.IDENTIFIER_EXISTS:
      return "This account already exists. Please try signing in.";

    case ClerkErrorCodes.INVALID_CREDENTIALS:
      return "Invalid credentials. Please check your information and try again.";

    case ClerkErrorCodes.SESSION_EXISTS:
      return "You are already signed in.";

    default:
      return firstError?.message || "Sign in failed. Please try again.";
  }
};
