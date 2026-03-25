import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MonthlyHistory from "../components/MonthlyHistory";
import MonthlyReport from "../components/MonthlyReport";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";

function MonthlyPage({ goPage }) {
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
      setTransactions(normalizeTransactions(res.data));
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📅 Monthly Analysis</h1>
          <p>Check your month-wise income and expense details</p>
        </section>

        <MonthlyReport transactions={transactions} />

        <div style={{ marginTop: "24px" }}>
          <MonthlyHistory transactions={transactions} />
        </div>
      </main>
    </div>
  );
}

export default MonthlyPage;