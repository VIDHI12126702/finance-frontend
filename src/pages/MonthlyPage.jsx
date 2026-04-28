import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MonthlyHistory from "../components/MonthlyHistory";
import MonthlyReport from "../components/MonthlyReport";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";

function MonthlyPage({ goPage, activePage }) {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [transactionRes, transferRes] = await Promise.all([
        API.get(`/transactions/user/${userId}`),
        API.get(`/transfers/user/${userId}`),
      ]);

      setTransactions(normalizeTransactions(transactionRes.data || []));
      setTransfers(transferRes.data || []);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
      setTransactions([]);
      setTransfers([]);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📅 Monthly Analysis</h1>
          <p>Check your month-wise income, expense and transfer details</p>
        </section>

        <MonthlyReport transactions={transactions} transfers={transfers} />

        <div style={{ marginTop: "24px" }}>
          <MonthlyHistory transactions={transactions} transfers={transfers} />
        </div>
      </main>
    </div>
  );
}

export default MonthlyPage;