export const parseAmount = (value: string) =>
  value.replaceAll(/\D/g, "").replace(/^0+/, "");

export const formatAmount = (amount: string) =>
  amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
