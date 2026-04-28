import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import YearlyAnalytics from "../components/YearlyAnalytics";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";

function YearlyPage({ goPage, activePage }) {
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
      console.error("Error fetching yearly data:", err);
      setTransactions([]);
      setTransfers([]);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📈 Yearly Analysis</h1>
          <p>Track your yearly balance performance</p>
        </section>

        <YearlyAnalytics transactions={transactions} transfers={transfers} />
      </main>
    </div>
  );
}

export default YearlyPage;