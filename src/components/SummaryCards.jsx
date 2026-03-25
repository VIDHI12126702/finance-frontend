import "./SummaryCards.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function SummaryCards({ income, expense, investment, balance }) {
  const symbol = getUserCurrencySymbol();
  const netFlow = income - expense;

  return (
    <div className="summary-grid">
      <Card
        title="Available Balance"
        amount={balance}
        subtitle="Current money available"
        icon="💰"
        symbol={symbol}
      />

      <Card
        title="Total Debit"
        amount={expense}
        subtitle="All money spent"
        icon="💳"
        symbol={symbol}
      />

      <Card
        title="Net Flow"
        amount={netFlow}
        subtitle="Debit vs Credit"
        icon="📊"
        symbol={symbol}
      />

      <Card
        title="Investment"
        amount={investment}
        subtitle="Money invested"
        icon="📈"
        symbol={symbol}
      />
    </div>
  );
}

function Card({ title, amount, subtitle, icon, symbol }) {
  return (
    <div
      className="summary-card"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <div>
        <p>{title}</p>
        <h2>
          {symbol}
          {amount}
        </h2>
        <small style={{ color: "#64748b" }}>{subtitle}</small>
      </div>

      <div style={{ fontSize: "30px" }}>{icon}</div>
    </div>
  );
}

export default SummaryCards;