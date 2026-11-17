import { ApiError, ApiResponse, isApiError } from "./types";

const BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";
const DEFAULT_TIMEOUT_MS = 15000;

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
  token?: string;
}

/**
 * Extracts a human-readable message from diverse backend error formats
 * (Django REST Framework, standard JSON, string arrays, detail objects).
 */
function extractErrorMessage(data: unknown, fallback: string): string {
  if (!data) return fallback;

  if (typeof data === "string") return data;

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;

    // Common DRF / JSON error keys
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }
    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }

    // DRF non_field_errors: ["Invalid credentials"]
    if (Array.isArray(record.non_field_errors) && record.non_field_errors.length > 0) {
      return String(record.non_field_errors[0]);
    }

    // DRF nested field errors: e.g. { email: ["Enter a valid email."], password: [...] }
    const fieldMessages: string[] = [];
    for (const [field, val] of Object.entries(record)) {
      if (field === "status_code" || field === "data") continue;
      if (Array.isArray(val) && val.length > 0) {
        fieldMessages.push(`${field}: ${val.join(", ")}`);
      } else if (typeof val === "string" && val.trim()) {
        fieldMessages.push(`${field}: ${val}`);
      }
    }

    if (fieldMessages.length > 0) {
      return fieldMessages.join(" | ");
    }
  }

  return fallback;
}

/**
 * Centralized server-side API client for backend communication.
 * All browser requests must go through Next.js Route Handlers (BFF layer).
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, token, headers, ...rest } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((headers as Record<string, string>) || {}),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let rawJson: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        rawJson = JSON.parse(text);
      } catch {
        rawJson = text;
      }
    }

    const isHttpError = !res.ok;
    const isPayloadError =
      typeof rawJson === "object" &&
      rawJson !== null &&
      "status_code" in rawJson &&
      typeof (rawJson as Record<string, unknown>).status_code === "number" &&
      ((rawJson as Record<string, unknown>).status_code as number) >= 400;

    if (isHttpError || isPayloadError) {
      const statusCode =
        isPayloadError && typeof rawJson === "object" && rawJson !== null
          ? ((rawJson as Record<string, unknown>).status_code as number)
          : res.status;

      const message = extractErrorMessage(
        rawJson,
        getErrorMessageForStatus(statusCode)
      );

      throw new ApiError(statusCode, message, rawJson);
    }

    if (typeof rawJson === "object" && rawJson !== null && "status_code" in rawJson) {
      return rawJson as ApiResponse<T>;
    }

    return {
      status_code: res.status,
      message: "Success",
      data: (rawJson as T) ?? null,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (isApiError(error)) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(408, "Request to backend timed out. Please try again.");
    }

    const message =
      error instanceof Error ? error.message : "Unable to reach the backend service.";
    throw new ApiError(503, message);
  }
}

function getErrorMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request data. Please check your input.";
    case 401:
      return "Invalid credentials or unauthorized.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested endpoint was not found on backend.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Internal server error. Please try again later.";
    default:
      return "An unexpected error occurred.";
  }
}
