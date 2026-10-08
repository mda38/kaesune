import { describe, expect, it } from "vitest";
import { formatAmount, parseAmount } from "@/features/withdrawal/amount";
import {
  initialWithdrawalForm,
  toWithdrawalInput,
  validateWithdrawalForm,
} from "@/features/withdrawal/withdrawal-form";

const validForm = () => ({
  ...initialWithdrawalForm(),
  purpose: "  夕食  ",
  amount: "2500",
  walletId: "wallet-1",
  withdrawnOn: "2026-10-08",
});

describe("出金フォーム", () => {
  it.each([
    [{ purpose: "  " }, "用途を入力してください。"],
    [{ amount: "0" }, "金額は正の円整数で入力してください。"],
    [{ amount: "1.5" }, "金額は正の円整数で入力してください。"],
    [{ amount: "-1" }, "金額は正の円整数で入力してください。"],
    [{ amount: "" }, "金額は正の円整数で入力してください。"],
    [{ walletId: "" }, "出金元の財布を選択してください。"],
  ])("未入力・不正値を拒否する: %j", (patch, message) => {
    expect(validateWithdrawalForm({ ...validForm(), ...patch })).toBe(message);
  });

  it("用途とメモの前後空白を除き、空メモを送信しない", () => {
    expect(validateWithdrawalForm(validForm())).toBeNull();
    expect(toWithdrawalInput({ ...validForm(), note: "  " })).toEqual({
      purpose: "夕食",
      amount: "2500",
      walletId: "wallet-1",
      withdrawnOn: "2026-10-08",
    });
    expect(toWithdrawalInput({ ...validForm(), note: "  駅前  " }).note).toBe(
      "駅前",
    );
  });

  it("日付未指定はローカルの当日を使う", () => {
    expect(
      toWithdrawalInput({ ...validForm(), withdrawnOn: "" }).withdrawnOn,
    ).toBe(initialWithdrawalForm().withdrawnOn);
  });
});

describe("金額の表示・入力変換", () => {
  it.each([
    ["", ""],
    ["000", ""],
    ["¥01,234", "1234"],
    ["12a3", "123"],
  ])("%sを数字だけに変換する", (value, expected) => {
    expect(parseAmount(value)).toBe(expected);
  });
  it("大きい整数も丸めずに表示し再入力できる", () => {
    const amount = "12345678901234567890";
    expect(formatAmount(amount)).toBe("12,345,678,901,234,567,890");
    expect(parseAmount(formatAmount(amount))).toBe(amount);
  });
});
