import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function MonthlyReport({ transactions = [], transfers = [] }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const symbol = getUserCurrencySymbol();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const reportYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let bankIncome = 0;
  let cashIncome = 0;
  let investmentIncome = 0;

  let bankExpense = 0;
  let cashExpense = 0;
  let investmentExpense = 0;

  let bankTransferIn = 0;
  let bankTransferOut = 0;
  let cashTransferIn = 0;
  let cashTransferOut = 0;
  let investmentTransferIn = 0;
  let investmentTransferOut = 0;

  transactions.forEach((t) => {
    const tDate = t.date ? new Date(t.date) : null;
    const tMonth =
      t.month !== undefined && t.month !== null
        ? t.month
        : tDate
        ? tDate.getMonth()
        : null;

    const tYear =
      t.year !== undefined && t.year !== null
        ? t.year
        : tDate
        ? tDate.getFullYear()
        : null;

    if (tMonth === lastMonth && tYear === reportYear) {
      const account = (t.account || t.paymentMethod || "BANK").toUpperCase();
      const type = (t.type || "").toUpperCase();
      const amount = Number(t.amount || 0);

      if (type === "INCOME") {
        if (account === "BANK") bankIncome += amount;
        else if (account === "CASH") cashIncome += amount;
        else if (account === "INVESTMENT") investmentIncome += amount;
      } else if (type === "EXPENSE") {
        if (account === "BANK") bankExpense += amount;
        else if (account === "CASH") cashExpense += amount;
        else if (account === "INVESTMENT") investmentExpense += amount;
      }
    }
  });

  transfers.forEach((tr) => {
    const trDate = tr.date ? new Date(tr.date) : null;
    if (!trDate) return;

    const trMonth = trDate.getMonth();
    const trYear = trDate.getFullYear();

    if (trMonth === lastMonth && trYear === reportYear) {
      const amount = Number(tr.amount || 0);
      const from = (tr.fromAccount || "").toUpperCase();
      const to = (tr.toAccount || "").toUpperCase();

      if (from === "BANK") bankTransferOut += amount;
      else if (from === "CASH") cashTransferOut += amount;
      else if (from === "INVESTMENT") investmentTransferOut += amount;

      if (to === "BANK") bankTransferIn += amount;
      else if (to === "CASH") cashTransferIn += amount;
      else if (to === "INVESTMENT") investmentTransferIn += amount;
    }
  });

  const bankBalance =
    bankIncome - bankExpense + bankTransferIn - bankTransferOut;
  const cashBalance =
    cashIncome - cashExpense + cashTransferIn - cashTransferOut;
  const investmentBalance =
    investmentIncome -
    investmentExpense +
    investmentTransferIn -
    investmentTransferOut;

  const totalSaving = bankBalance + cashBalance;
  const overallTotal = bankBalance + cashBalance + investmentBalance;

  const hasData =
    bankIncome !== 0 ||
    cashIncome !== 0 ||
    investmentIncome !== 0 ||
    bankExpense !== 0 ||
    cashExpense !== 0 ||
    investmentExpense !== 0 ||
    bankTransferIn !== 0 ||
    bankTransferOut !== 0 ||
    cashTransferIn !== 0 ||
    cashTransferOut !== 0 ||
    investmentTransferIn !== 0 ||
    investmentTransferOut !== 0;

  if (!hasData) {
    return (
      <div className="analytics-card">
        <h2 className="analytics-title">Previous Month Report</h2>
        <p>No data found for previous month.</p>
      </div>
    );
  }

  const monthName = new Date(reportYear, lastMonth).toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="analytics-card">
      <h2 className="analytics-title">
        {monthName} {reportYear} Report
      </h2>

      <div className="analytics-summary">
        <p>Bank Balance : {symbol}{bankBalance}</p>
        <p>Cash Balance : {symbol}{cashBalance}</p>
        <p>Investment Balance : {symbol}{investmentBalance}</p>
        <p><b>Total Saving : {symbol}{totalSaving}</b></p>
        <p><b>Overall Total : {symbol}{overallTotal}</b></p>
      </div>
    </div>
  );
}

export default MonthlyReport;