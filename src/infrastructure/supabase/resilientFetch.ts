type RetryableRequest = RequestInit & { method?: string };

const RETRY_DELAYS_MS = [300, 900];

function isPostgrestJwtTimingError(response: Response, url: string, method: string) {
  if (method !== "GET" && method !== "HEAD") return false;
  if (response.status !== 401 || !url.includes("/rest/v1/")) return false;
  return true;
}

/**
 * Bounded resilience for the known Supabase/PostgREST PGRST303 timing failure.
 * Only authenticated/idempotent reads are retried; writes are never replayed.
 */
export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RetryableRequest,
): Promise<Response> {
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const response = await fetch(input, init);

    if (!isPostgrestJwtTimingError(response, url, method) || attempt === RETRY_DELAYS_MS.length) {
      return response;
    }

    // PGRST303 has a small, transient recovery window when the validator's clock catches up.
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }

  throw new Error("Unreachable resilientFetch state");
}
