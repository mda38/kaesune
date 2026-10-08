import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { withdrawalQueries } from "@/features/withdrawal/queries";
import { claimQueries } from "@/features/claim/queries";

for (const { name, listKey, observe } of [
  {
    name: "withdrawal",
    listKey: withdrawalQueries.list("group").queryKey,
    observe: (client: QueryClient) =>
      new QueryObserver(
        client,
        withdrawalQueries.detail("group", "target", client),
      ),
  },
  {
    name: "claim",
    listKey: claimQueries.list("group").queryKey,
    observe: (client: QueryClient) =>
      new QueryObserver(client, claimQueries.detail("group", "target", client)),
  },
]) {
  describe(`${name} detail cache`, () => {
    it("fresh な一覧データとその更新時刻を再利用する", () => {
      const client = new QueryClient();
      const item = { id: "target" };
      client.setQueryData<unknown[]>(listKey, [item], {
        updatedAt: 100,
      });
      const query = observe(client);
      expect(query.getCurrentResult().data).toBe(item);
      expect(query.getCurrentResult().dataUpdatedAt).toBe(100);
    });
    it("更新で無効化された一覧を詳細の初期値にしない", async () => {
      const client = new QueryClient();
      client.setQueryData<unknown[]>(listKey, [{ id: "target" }]);
      await client.invalidateQueries({
        queryKey: listKey,
      });
      const query = observe(client);
      expect(query.getCurrentResult().data).toBeUndefined();
    });
  });
}
