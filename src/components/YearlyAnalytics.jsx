import { Chart } from "primereact/chart";
import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function YearlyAnalytics({ transactions = [], transfers = [] }) {
  const currentYear = new Date().getFullYear();
  const symbol = getUserCurrencySymbol();

  const monthlyBank = Array(12).fill(0);
  const monthlyCash = Array(12).fill(0);
  const monthlyInvestment = Array(12).fill(0);

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

    if (tYear === currentYear && tMonth !== null) {
      const type = (t.type || "").toUpperCase();
      const account = (t.account || t.paymentMethod || "BANK").toUpperCase();
      const amount = Number(t.amount || 0);
      const signedAmount = type === "INCOME" ? amount : -amount;

      if (account === "BANK") {
        monthlyBank[tMonth] += signedAmount;
      } else if (account === "CASH") {
        monthlyCash[tMonth] += signedAmount;
      } else if (account === "INVESTMENT") {
        monthlyInvestment[tMonth] += signedAmount;
      }
    }
  });

  transfers.forEach((tr) => {
    const trDate = tr.date ? new Date(tr.date) : null;
    if (!trDate) return;

    const trMonth = trDate.getMonth();
    const trYear = trDate.getFullYear();
    if (trYear !== currentYear) return;

    const amount = Number(tr.amount || 0);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "BANK") monthlyBank[trMonth] -= amount;
    else if (from === "CASH") monthlyCash[trMonth] -= amount;
    else if (from === "INVESTMENT") monthlyInvestment[trMonth] -= amount;

    if (to === "BANK") monthlyBank[trMonth] += amount;
    else if (to === "CASH") monthlyCash[trMonth] += amount;
    else if (to === "INVESTMENT") monthlyInvestment[trMonth] += amount;
  });

  const data = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
    datasets: [
      {
        label: `Bank Balance (${symbol.trim()})`,
        data: monthlyBank,
        backgroundColor: "#3b82f6",
      },
      {
        label: `Cash Balance (${symbol.trim()})`,
        data: monthlyCash,
        backgroundColor: "#10b981",
      },
      {
        label: `Investment Balance (${symbol.trim()})`,
        data: monthlyInvestment,
        backgroundColor: "#f59e0b",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="analytics-card">
      <h2 className="analytics-title">Yearly Financial Analytics</h2>
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}

export default YearlyAnalytics;