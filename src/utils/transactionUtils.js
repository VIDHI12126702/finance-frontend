import { toMoneyNumber } from "./moneyUtils";
import { parseLocalDate } from "./dateUtils";

export const normalizeTransactions = (transactions = []) => {
  return transactions.map((item) => ({
    ...item,
    amount: toMoneyNumber(item.amount),
    type: String(item.type || "").toUpperCase(),
    category: item.category || "",
    account: String(item.account || item.paymentMethod || "BANK").toUpperCase(),
    notes: item.notes || item.note || "",
    bill: item.bill || null,
    date: item.date || "",
    localDate: item.date ? parseLocalDate(item.date) : null,
  }));
};

export const calculateSummary = (transactions = []) => {
  let bankBalance = 0;
  let cashBalance = 0;
  let investmentBalance = 0;

  transactions.forEach((item) => {
    const amount = toMoneyNumber(item.amount);
    const type = String(item.type || "").toUpperCase();
    const account = String(item.account || "BANK").toUpperCase();

    if (type !== "INCOME" && type !== "EXPENSE") return;

    const signedAmount = type === "INCOME" ? amount : -amount;

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