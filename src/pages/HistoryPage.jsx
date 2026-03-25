import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import TransactionTable from "../components/TransactionTable";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";
import "./HistoryPage.css";

function HistoryPage({ goPage }) {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

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
      console.error("Error fetching history:", err);
    }
  };

  const categoryOptions = useMemo(() => {
    const categories = transactions
      .map((t) => t.category)
      .filter((c) => c && c.trim() !== "");
    return ["All", ...new Set(categories)];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        searchText.trim() === "" ||
        (t.type || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (t.category || "").toLowerCase().includes(searchText.toLowerCase()) ||
        String(t.amount || "").includes(searchText) ||
        (t.date || "").includes(searchText);

      const matchesType =
        typeFilter === "All" || (t.type || "") === typeFilter;

      const matchesCategory =
        categoryFilter === "All" || (t.category || "") === categoryFilter;

      const matchesDate =
        dateFilter === "" || (t.date || "") === dateFilter;

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchText, typeFilter, categoryFilter, dateFilter]);

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📜 Transaction History</h1>
          <p>View, search and filter your transactions</p>
        </section>

        <section className="page-box">
          <div className="history-filter-grid">
            <input
              type="text"
              placeholder="Search by type, category, amount or date"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="history-input"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="history-input"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Investment">Investment</option>
              <option value="Personal Use">Personal Use</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="history-input"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="history-input"
            />
          </div>

          <div className="history-filter-actions">
            <button
              className="clear-filter-btn"
              onClick={() => {
                setSearchText("");
                setTypeFilter("All");
                setCategoryFilter("All");
                setDateFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>

          <TransactionTable
            transactions={filteredTransactions}
            fetchData={fetchData}
          />
        </section>
      </main>
    </div>
  );
}

export default HistoryPage;