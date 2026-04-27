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
    if (userId) {
      refreshDashboard();
    }
  }, [userId]);

  const money = (value) => Number(Number(value || 0).toFixed(2));

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

  let cashBalance = money(transactionSummary.cashBalance);
  let bankBalance = money(transactionSummary.bankBalance);
  let investmentBalance = money(transactionSummary.investmentBalance);

  transfers.forEach((tr) => {
    const amount = money(tr.amount);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "CASH") cashBalance -= amount;
    else if (from === "BANK") bankBalance -= amount;
    else if (from === "INVESTMENT") investmentBalance -= amount;

    if (to === "CASH") cashBalance += amount;
    else if (to === "BANK") bankBalance += amount;
    else if (to === "INVESTMENT") investmentBalance += amount;
  });

  cashBalance = money(cashBalance);
  bankBalance = money(bankBalance);
  investmentBalance = money(investmentBalance);

  // Your rule: Total Saving = Bank + Cash only
  const totalSaving = money(bankBalance + cashBalance);

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📊 Dashboard</h1>
          <p>Bank, Cash, Investment and Total Saving overview</p>
        </section>

        <SummaryCards
          bankBalance={bankBalance}
          cashBalance={cashBalance}
          investmentBalance={investmentBalance}
          totalSaving={totalSaving}
        />

        <section className="page-box dashboard-clean-box">
          <h2>💡 Summary Rule</h2>
          <p>
            <b>Total Saving</b> is calculated using only <b>Bank + Cash</b>.
            Investment is shown separately.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;