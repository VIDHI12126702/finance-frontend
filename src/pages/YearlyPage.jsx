import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import YearlyAnalytics from "../components/YearlyAnalytics";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";

function YearlyPage({ goPage }) {
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
      console.error("Error fetching yearly data:", err);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📈 Yearly Analysis</h1>
          <p>Track your yearly savings performance</p>
        </section>

        <YearlyAnalytics transactions={transactions} />
      </main>
    </div>
  );
}

export default YearlyPage;