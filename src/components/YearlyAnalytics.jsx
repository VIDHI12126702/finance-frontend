import { Chart } from "primereact/chart";
import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function YearlyAnalytics({ transactions }) {
  const currentYear = new Date().getFullYear();
  const symbol = getUserCurrencySymbol();

  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);
  const monthlyInvestment = Array(12).fill(0);

  transactions.forEach((t) => {
    if (t.year === currentYear) {
      if (t.type === "Income") {
        monthlyIncome[t.month] += Number(t.amount);
      } else if (t.type === "Investment") {
        monthlyInvestment[t.month] += Number(t.amount);
      } else {
        monthlyExpense[t.month] += Number(t.amount);
      }
    }
  });

  const monthlyBalance = monthlyIncome.map(
    (inc, i) => inc - monthlyExpense[i] - monthlyInvestment[i]
  );

  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: `Monthly Balance (${symbol.trim()})`,
        data: monthlyBalance,
        backgroundColor: "#4f46e5",
      },
    ],
  };

  return (
    <div className="analytics-card">
      <h2 className="analytics-title">Yearly Financial Analytics</h2>
      <Chart type="bar" data={data} />
    </div>
  );
}

export default YearlyAnalytics;