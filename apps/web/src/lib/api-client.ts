const apiOrigin = (
  import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8787"
).replace(/\/$/, "");

type ErrorResponse = { message?: string };

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const request = async <T>(
  path: string,
  options: RequestInit = {},
  errorMessage: string,
): Promise<T> => {
  const response = await fetch(`${apiOrigin}${path}`, {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    throw new ApiRequestError(response.status, body?.message ?? errorMessage);
  }

  return response.json() as Promise<T>;
};

export const get = <T>(path: string, signal?: AbortSignal) => {
  return request<T>(path, { signal }, "データの取得に失敗しました。");
};

export const post = <T>(path: string, body: unknown) => {
  return request<T>(
    path,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "データの作成に失敗しました。",
  );
};

export const put = <T>(path: string, body: unknown) => {
  return request<T>(
    path,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "データの更新に失敗しました。",
  );
};

export const patch = <T>(path: string, body: unknown) => {
  return request<T>(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "データの更新に失敗しました。",
  );
};

export const del = async (path: string): Promise<void> => {
  const response = await fetch(`${apiOrigin}${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ErrorResponse | null;
    throw new ApiRequestError(
      response.status,
      body?.message ?? "データの削除に失敗しました。",
    );
  }
};
