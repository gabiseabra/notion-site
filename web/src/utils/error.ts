export function extractErrorMessage(
  error: unknown,
  fallback: string = "An unknown error occurred",
) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
