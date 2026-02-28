export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function httpError(status: number, message: string): never {
  throw new HttpError(status, message);
}
