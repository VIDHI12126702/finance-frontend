import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import SummaryCards from "../components/SummaryCards";
import AddIncome from "../components/AddIncome";
import AddExpense from "../components/AddExpense";
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

  const fetchTransactions = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const normalized = normalizeTransactions(res.data || []);
      setTransactions(normalized);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setTransactions([]);
    }
  };

  const fetchTransfers = async () => {
    try {
      const res = await API.get(`/transfers/user/${userId}`);
      setTransfers(res.data || []);
    } catch (err) {
      console.error("Error fetching transfers:", err);
      setTransfers([]);
    }
  };

  const refreshDashboard = async () => {
    await fetchTransactions();
    await fetchTransfers();
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

  // IMPORTANT: only Cash + Bank
  const totalSaving = cashBalance + bankBalance;

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>💰 Finance Dashboard</h1>
          <p>Manage your money smartly</p>
        </section>

        <SummaryCards
          bankBalance={bankBalance}
          cashBalance={cashBalance}
          investmentBalance={investmentBalance}
          totalSaving={totalSaving}
        />

        <section className="form-grid">
          <div className="page-box">
            <h3>💰 Add Income</h3>
            <AddIncome fetchData={refreshDashboard} userId={userId} />
          </div>

          <div className="page-box">
            <h3>💸 Add Expense</h3>
            <AddExpense fetchData={refreshDashboard} userId={userId} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;