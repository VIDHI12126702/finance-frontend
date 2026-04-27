export const normalizeTransactions = (transactions = []) => {
  return transactions.map((item) => ({
    ...item,
    amount: Number(item.amount || 0),
    type: item.type || "",
    category: item.category || "",
    account: item.account || "BANK",
    notes: item.notes || "",
    date: item.date || "",
  }));
};

export const calculateSummary = (transactions = []) => {
  let bankBalance = 0;
  let cashBalance = 0;
  let investmentBalance = 0;

  transactions.forEach((item) => {
    const amount = Number(item.amount || 0);
    const signedAmount = item.type === "INCOME" ? amount : -amount;

    if (item.account === "BANK") {
      bankBalance += signedAmount;
    } else if (item.account === "CASH") {
      cashBalance += signedAmount;
    } else if (item.account === "INVESTMENT") {
      investmentBalance += signedAmount;
    }
  });

  const totalSaving = bankBalance + cashBalance + investmentBalance;

  return {
    bankBalance,
    cashBalance,
    investmentBalance,
    totalSaving,
  };
};

export const filterTransactionsByMonth = (transactions = [], month, year) => {
  return transactions.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });
};

export const filterTransactionsByYear = (transactions = [], year) => {
  return transactions.filter((item) => {
    if (!item.date) return false;
    const d = new Date(item.date);
    return d.getFullYear() === year;
  });
};