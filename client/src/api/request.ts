const PROD_API_BASE_URL = "/";
const API_BASE_URL = import.meta.env.DEV ? "" : PROD_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // 正确处理 URL 拼接，避免双斜杠问题
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${baseUrl}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const payload = await response.json().catch(() => null);

    if (payload && typeof payload === "object" && "code" in payload) {
      const result = payload as {
        code: number;
        msg?: string;
        data?: T;
      };

      if (result.code !== 0) {
        throw new ApiError(result.code, result.msg || "请求失败", result.data);
      }

      return (result.data ?? {}) as T;
    }

    if (!response.ok) {
      throw new ApiError(
        response.status,
        (payload &&
          typeof payload === "object" &&
          "message" in payload &&
          String(payload.message)) ||
          response.statusText ||
          `请求失败: ${response.status}`,
        payload,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      error instanceof Error ? error.message : "网络请求失败",
    );
  }
}

export const http = {
  get: <T>(endpoint: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    }),
};
