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

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const normalized = normalizeTransactions(res.data);
      setTransactions(normalized);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const { income, expense, investment, balance } =
    calculateSummary(transactions);

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>💰 Finance Dashboard</h1>
          <p>Manage your money smartly</p>
        </section>

        <SummaryCards
          income={income}
          expense={expense}
          investment={investment}
          balance={balance}
        />

        <section className="form-grid">
          <div className="page-box">
            <h3>💰 Add Income</h3>
            <AddIncome fetchData={fetchData} userId={userId} />
          </div>

          <div className="page-box">
            <h3>💸 Add Expense Category</h3>
            <AddExpense fetchData={fetchData} userId={userId} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;