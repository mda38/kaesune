import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "./api-client";
import { createQueryClient } from "./query-client";

describe("createQueryClient", () => {
  const onUnauthenticated = vi.fn();
  let client: ReturnType<typeof createQueryClient>;

  beforeEach(() => {
    onUnauthenticated.mockClear();
    client = createQueryClient(onUnauthenticated);
    client.setDefaultOptions({
      ...client.getDefaultOptions(),
      queries: { ...client.getDefaultOptions().queries, retryDelay: 0 },
    });
  });

  afterEach(() => {
    client.clear();
  });

  it("キャンセルされた取得を再試行しない", async () => {
    const error = new DOMException("キャンセル", "AbortError");
    const queryFn = vi.fn().mockRejectedValue(error);

    await expect(
      client.fetchQuery({ queryKey: ["cancelled"], queryFn }),
    ).rejects.toBe(error);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("クライアントエラーを再試行せず、既存のキャッシュを保持する", async () => {
    const error = new ApiRequestError(400, "入力エラー");
    const queryFn = vi.fn().mockRejectedValue(error);
    client.setQueryData(["wallets"], ["共有財布"]);

    await expect(
      client.fetchQuery({ queryKey: ["invalid"], queryFn }),
    ).rejects.toBe(error);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(["wallets"])).toEqual(["共有財布"]);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("サーバーエラーは2回まで再試行して終了する", async () => {
    const error = new ApiRequestError(500, "サーバーエラー");
    const queryFn = vi.fn().mockRejectedValue(error);

    await expect(
      client.fetchQuery({ queryKey: ["unavailable"], queryFn }),
    ).rejects.toBe(error);

    expect(queryFn).toHaveBeenCalledTimes(3);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it("認証失効時は再試行せずキャッシュを破棄し、認証失効を通知する", async () => {
    const error = new ApiRequestError(401, "認証失効");
    const queryFn = vi.fn().mockRejectedValue(error);
    client.setQueryData(["wallets"], ["共有財布"]);

    await expect(
      client.fetchQuery({ queryKey: ["session"], queryFn }),
    ).rejects.toBe(error);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryCache().getAll()).toEqual([]);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });
});
