import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import TransactionTable from "../components/TransactionTable";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";
import "./HistoryPage.css";

function HistoryPage({ goPage, activePage }) {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/transactions/user/${userId}`);
      setTransactions(normalizeTransactions(res.data || []));
    } catch (err) {
      console.error("Error fetching history:", err);
      setTransactions([]);
    } finally {
      setLoading(false);
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
      const text = searchText.toLowerCase();

      const matchesSearch =
        searchText.trim() === "" ||
        (t.type || "").toLowerCase().includes(text) ||
        (t.category || "").toLowerCase().includes(text) ||
        (t.account || "").toLowerCase().includes(text) ||
        String(t.amount || "").includes(searchText) ||
        (t.date || "").includes(searchText) ||
        (t.notes || "").toLowerCase().includes(text);

      const matchesType =
        typeFilter === "All" || (t.type || "").toUpperCase() === typeFilter;

      const matchesCategory =
        categoryFilter === "All" || (t.category || "") === categoryFilter;

      const matchesDate = dateFilter === "" || (t.date || "") === dateFilter;

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchText, typeFilter, categoryFilter, dateFilter]);

  const clearFilters = () => {
    setSearchText("");
    setTypeFilter("All");
    setCategoryFilter("All");
    setDateFilter("");
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>📜 Transaction History</h1>
          <p>View, search, edit and delete your transactions</p>
        </section>

        <section className="page-box">
          <div className="history-filter-grid">
            <input
              type="text"
              placeholder="Search type, category, amount, date or note"
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
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="history-input"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
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
            <button className="clear-filter-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <TransactionTable
              transactions={filteredTransactions}
              fetchData={fetchData}
              userId={userId}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default HistoryPage;