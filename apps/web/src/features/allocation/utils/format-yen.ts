export const formatYen = (amount: bigint) => {
  return `¥${amount.toLocaleString("ja-JP")}`;
};
