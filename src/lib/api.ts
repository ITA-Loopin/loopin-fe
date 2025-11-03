type SearchParams = Record<
  string,
  string | number | boolean | null | undefined
>;

interface ApiFetchOptions extends RequestInit {
  accessToken?: string | null;
  searchParams?: SearchParams;
  json?: unknown;
}

const API_PREFIX = "/api-proxy";

function resolveUrl(path: string, searchParams?: SearchParams) {
  const base = path.startsWith("http")
    ? path
    : `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  if (!searchParams) {
    return base;
  }

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });

  const queryString = params.toString();
  if (!queryString) {
    return base;
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${queryString}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
) {
  const { accessToken, json, searchParams, headers, ...rest } = options;

  const url = resolveUrl(path, searchParams);
  const finalHeaders: HeadersInit = {
    Accept: "application/json",
    ...headers,
  };

  if (accessToken) {
    (finalHeaders as Record<string, string>).Authorization =
      `Bearer ${accessToken}`;
  }

  const requestInit: RequestInit = {
    cache: "no-store",
    ...rest,
    headers: finalHeaders,
  };

  if (json !== undefined) {
    requestInit.body = JSON.stringify(json);
    (requestInit.headers as Record<string, string>)["Content-Type"] =
      "application/json";
  }

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "요청 처리 중 오류가 발생했습니다.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
