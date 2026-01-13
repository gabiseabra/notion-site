import { ORPCError } from "@orpc/contract";

/**
 * Extracts a human-facing message from an unknown error value.
 *
 * Intended for UI display. If the value is an `Error`, returns `error.message`;
 * otherwise returns the provided `fallback`.
 */
export function extractErrorMessage(
  error: unknown,
  fallback: string = "An unknown error occurred",
) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function extractErrorCode(error: unknown) {
  if (error instanceof ORPCError) {
    return error.code;
  }
}

/**
 * Formats an unknown error value into a loggable representation.
 */
export function showError(error: unknown) {
  const message = extractErrorMessage(error, "");
  const details = JSON.stringify(error, undefined, 2);

  if (message) {
    return `${message}: ${details}`;
  } else {
    return details;
  }
}
