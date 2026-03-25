export function normalizeTransactions(data = []) {
  return data.map((t) => {
    const parsedDate = t.date ? new Date(t.date) : new Date();

    return {
      ...t,
      amount: Number(t.amount || 0),
      date: t.date ? t.date : parsedDate.toISOString().split("T")[0],
      month:
        t.month !== undefined && t.month !== null
          ? Number(t.month)
          : parsedDate.getMonth(),
      year:
        t.year !== undefined && t.year !== null
          ? Number(t.year)
          : parsedDate.getFullYear(),
      bill: t.bill || null,
      category: t.category || "",
    };
  });
}

export function calculateSummary(transactions = []) {
  let income = 0;
  let expense = 0;
  let investment = 0;

  transactions.forEach((t) => {
    if (t.type === "Income") {
      income += Number(t.amount);
    } else if (t.type === "Investment") {
      investment += Number(t.amount);
    } else {
      expense += Number(t.amount);
    }
  });

  return {
    income,
    expense,
    investment,
    balance: income - expense - investment,
  };
}