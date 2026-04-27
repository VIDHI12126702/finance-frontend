import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCards from "../components/SummaryCards";
import API from "../api";
import {
  normalizeTransactions,
  calculateSummary,
} from "../utils/transactionUtils";
import "./PageLayout.css";

function Dashboard({ goPage }) {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) refreshDashboard();
  }, [userId]);

  const refreshDashboard = async () => {
    try {
      const [transactionRes, transferRes] = await Promise.all([
        API.get(`/transactions/user/${userId}`),
        API.get(`/transfers/user/${userId}`),
      ]);

      setTransactions(normalizeTransactions(transactionRes.data || []));
      setTransfers(transferRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setTransactions([]);
      setTransfers([]);
    }
  };

  const transactionSummary = calculateSummary(transactions);

  let cashBalance = Number(transactionSummary.cashBalance || 0);
  let bankBalance = Number(transactionSummary.bankBalance || 0);
  let investmentBalance = Number(transactionSummary.investmentBalance || 0);

  transfers.forEach((tr) => {
    const amount = Number(tr.amount || 0);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "CASH") cashBalance -= amount;
    else if (from === "BANK") bankBalance -= amount;
    else if (from === "INVESTMENT") investmentBalance -= amount;

    if (to === "CASH") cashBalance += amount;
    else if (to === "BANK") bankBalance += amount;
    else if (to === "INVESTMENT") investmentBalance += amount;
  });

  const totalSaving = cashBalance + bankBalance;

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Your balance overview</p>
        </section>

        <SummaryCards
          bankBalance={bankBalance}
          cashBalance={cashBalance}
          investmentBalance={investmentBalance}
          totalSaving={totalSaving}
        />

        <section className="page-box dashboard-clean-box">
          <h2>Welcome back 👋</h2>
          <p>
            Use the <b>Home</b> page to add income and expenses. This dashboard
            now shows only your financial summary.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;