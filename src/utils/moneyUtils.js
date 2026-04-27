export const toMoneyNumber = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Number(num.toFixed(2));
};

export const formatMoney = (value) => {
  return toMoneyNumber(value).toFixed(2);
};