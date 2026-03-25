import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function MonthlyReport({ transactions }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const symbol = getUserCurrencySymbol();

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const reportYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  let income = 0;
  let expense = 0;
  let investment = 0;

  transactions.forEach((t) => {
    if (t.month === lastMonth && t.year === reportYear) {
      if (t.type === "Income") {
        income += Number(t.amount);
      } else if (t.type === "Investment") {
        investment += Number(t.amount);
      } else {
        expense += Number(t.amount);
      }
    }
  });

  const saving = income - expense - investment;

  if (income === 0 && expense === 0 && investment === 0) {
    return null;
  }

  return (
    <div className="analytics-card">
      <h2 className="analytics-title">Last Month Financial Report</h2>
      <p>Total Income : {symbol}{income}</p>
      <p>Total Expense : {symbol}{expense}</p>
      <p>Total Investment : {symbol}{investment}</p>
      <p>
        <b>Total Balance : {symbol}{saving}</b>
      </p>
    </div>
  );
}

export default MonthlyReport;