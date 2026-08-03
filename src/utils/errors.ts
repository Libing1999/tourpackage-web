import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "Can't reach the server. Check your connection and try again.";

/**
 * Every mutation's onError funnels through this so the user always sees the
 * backend's actual message (GlobalExceptionHandler's ErrorResponse.message)
 * instead of a generic "Request failed with status code 400".
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return NETWORK_MESSAGE;
    }
    return error.response.data?.message ?? FALLBACK_MESSAGE;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return FALLBACK_MESSAGE;
}

/**
 * Field-level validation errors from Jakarta Bean Validation
 * (MethodArgumentNotValidException -> fieldErrors), keyed by field name so
 * a form can call react-hook-form's setError for each.
 */
export function getFieldErrors(error: unknown): Record<string, string> | null {
  if (isAxiosError<ApiErrorResponse>(error) && error.response?.data?.fieldErrors) {
    return error.response.data.fieldErrors;
  }
  return null;
}
