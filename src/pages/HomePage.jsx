import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import AddIncome from "../components/AddIncome";
import AddExpense from "../components/AddExpense";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import { formatMoney } from "../utils/moneyUtils";
import "./PageLayout.css";

function HomePage({ goPage }) {
  const [transactions, setTransactions] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;
  const symbol = getUserCurrencySymbol();

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      setTransactions(normalizeTransactions(res.data || []));
    } catch (err) {
      console.error("Home fetch error:", err);
      setTransactions([]);
    }
  };

  const incomeList = useMemo(
    () => transactions.filter((t) => t.type === "INCOME").slice(0, 8),
    [transactions]
  );

  const expenseList = useMemo(
    () => transactions.filter((t) => t.type === "EXPENSE").slice(0, 8),
    [transactions]
  );

  const TableCard = ({ title, items, type }) => (
    <div className="home-table-card">
      <div className="home-table-header">
        <h2>{title}</h2>
        <span>{items.length} Recent</span>
      </div>

      {items.length === 0 ? (
        <p className="home-empty">No records found.</p>
      ) : (
        <div className="home-list">
          {items.map((item) => (
            <div className="home-row" key={item.id}>
              <div>
                <h4>{item.category || "-"}</h4>
                <p>
                  {item.account || "BANK"} • {item.date || "-"}
                </p>
                {item.notes && <small>{item.notes}</small>}
              </div>

              <strong className={type === "income" ? "money-green" : "money-red"}>
                {type === "income" ? "+" : "-"} {symbol}
                {formatMoney(item.amount)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🏠 Home</h1>
          <p>Add income, add expense and quickly view recent records</p>
        </section>

        <section className="home-form-grid">
          <div className="home-form-card income-card">
            <AddIncome fetchData={fetchData} userId={userId} />
          </div>

          <div className="home-form-card expense-card">
            <AddExpense fetchData={fetchData} userId={userId} />
          </div>
        </section>

        <section className="home-table-grid">
          <TableCard title="💰 Income Records" items={incomeList} type="income" />
          <TableCard title="💸 Expense Records" items={expenseList} type="expense" />
        </section>
      </main>
    </div>
  );
}

export default HomePage;