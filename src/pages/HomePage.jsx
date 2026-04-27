import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import AddIncome from "../components/AddIncome";
import AddExpense from "../components/AddExpense";
import API from "../api";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { normalizeTransactions } from "../utils/transactionUtils";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import { formatMoney } from "../utils/moneyUtils";
import "./PageLayout.css";

function HomePage({ goPage }) {
  const [transactions, setTransactions] = useState([]);
  const [incomeDialog, setIncomeDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);

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
    () => transactions.filter((t) => t.type === "INCOME").slice(0, 6),
    [transactions]
  );

  const expenseList = useMemo(
    () => transactions.filter((t) => t.type === "EXPENSE").slice(0, 6),
    [transactions]
  );

  const closeIncome = async () => {
    setIncomeDialog(false);
    await fetchData();
  };

  const closeExpense = async () => {
    setExpenseDialog(false);
    await fetchData();
  };

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

              <strong
                className={type === "income" ? "money-green" : "money-red"}
              >
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
          <p>Add income or expense quickly</p>
        </section>

        <section className="home-action-grid">
          <div className="home-action-card income-action">
            <div>
              <h2>💰 Add Income</h2>
              <p>Add salary, returned money or other income.</p>
            </div>

            <Button
              label="Open Income Form"
              icon="pi pi-plus"
              className="w-full"
              severity="success"
              onClick={() => setIncomeDialog(true)}
            />
          </div>

          <div className="home-action-card expense-action">
            <div>
              <h2>💸 Add Expense</h2>
              <p>Add bills, grocery, rent, personal use and more.</p>
            </div>

            <Button
              label="Open Expense Form"
              icon="pi pi-minus"
              className="w-full"
              severity="danger"
              onClick={() => setExpenseDialog(true)}
            />
          </div>
        </section>

        <section className="home-table-grid">
          <TableCard title="💰 Income Records" items={incomeList} type="income" />
          <TableCard title="💸 Expense Records" items={expenseList} type="expense" />
        </section>

        <Dialog
          header="💰 Add Income"
          visible={incomeDialog}
          modal
          style={{ width: "95%", maxWidth: "700px" }}
          onHide={closeIncome}
        >
          <AddIncome
            fetchData={async () => {
              await fetchData();
              setIncomeDialog(false);
            }}
            userId={userId}
          />
        </Dialog>

        <Dialog
          header="💸 Add Expense"
          visible={expenseDialog}
          modal
          style={{ width: "95%", maxWidth: "700px" }}
          onHide={closeExpense}
        >
          <AddExpense
            fetchData={async () => {
              await fetchData();
              setExpenseDialog(false);
            }}
            userId={userId}
          />
        </Dialog>
      </main>
    </div>
  );
}

export default HomePage;