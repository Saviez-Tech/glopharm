export interface ApiResponse<T = unknown> {
  status_code: number;
  message: string;
  data: T | null;
}

export class ApiError extends Error {
  statusCode: number;
  data: unknown;

  constructor(statusCode: number, message: string, data: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(err: unknown): err is ApiError {
  if (err instanceof ApiError) return true;
  if (typeof err === "object" && err !== null && "statusCode" in err) {
    const candidate = err as { name?: string; statusCode?: unknown };
    return (
      candidate.name === "ApiError" ||
      typeof candidate.statusCode === "number"
    );
  }
  return false;
}
