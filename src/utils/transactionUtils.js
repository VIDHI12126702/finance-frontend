import { toMoneyNumber } from "./moneyUtils";

export const normalizeTransactions = (transactions = []) => {
  return transactions.map((item) => ({
    ...item,
    amount: toMoneyNumber(item.amount),
    type: (item.type || "").toUpperCase(),
    category: item.category || "",
    account: (item.account || item.paymentMethod || "BANK").toUpperCase(),
    notes: item.notes || item.note || "",
    date: item.date || "",
  }));
};

export const calculateSummary = (transactions = []) => {
  let bankBalance = 0;
  let cashBalance = 0;
  let investmentBalance = 0;

  transactions.forEach((item) => {
    const amount = toMoneyNumber(item.amount);
    const signedAmount = item.type === "INCOME" ? amount : -amount;
    const account = (item.account || "BANK").toUpperCase();

    if (account === "BANK") bankBalance += signedAmount;
    else if (account === "CASH") cashBalance += signedAmount;
    else if (account === "INVESTMENT") investmentBalance += signedAmount;
  });

  return {
    bankBalance: toMoneyNumber(bankBalance),
    cashBalance: toMoneyNumber(cashBalance),
    investmentBalance: toMoneyNumber(investmentBalance),
    totalSaving: toMoneyNumber(bankBalance + cashBalance),
  };
};