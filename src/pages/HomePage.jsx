import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AddIncome from "../components/AddIncome";
import AddExpense from "../components/AddExpense";
import API from "../api";
import {
  normalizeTransactions,
  calculateSummary,
} from "../utils/transactionUtils";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./PageLayout.css";

function HomePage({ goPage, activePage }) {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [showIncome, setShowIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;
  const symbol = getUserCurrencySymbol();

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const money = (value) => Number(Number(value || 0).toFixed(2));

  const loadData = async () => {
    try {
      const [transactionRes, transferRes] = await Promise.all([
        API.get(`/transactions/user/${userId}`),
        API.get(`/transfers/user/${userId}`),
      ]);

      setTransactions(normalizeTransactions(transactionRes.data || []));
      setTransfers(transferRes.data || []);
    } catch (err) {
      console.error("Home load error:", err);
      setTransactions([]);
      setTransfers([]);
    }
  };

  const summary = calculateSummary(transactions);

  let cashBalance = money(summary.cashBalance);
  let bankBalance = money(summary.bankBalance);
  let investmentBalance = money(summary.investmentBalance);

  transfers.forEach((tr) => {
    const amount = money(tr.amount);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "CASH") cashBalance -= amount;
    if (from === "BANK") bankBalance -= amount;
    if (from === "INVESTMENT") investmentBalance -= amount;

    if (to === "CASH") cashBalance += amount;
    if (to === "BANK") bankBalance += amount;
    if (to === "INVESTMENT") investmentBalance += amount;
  });

  cashBalance = money(cashBalance);
  bankBalance = money(bankBalance);
  investmentBalance = money(investmentBalance);

  const totalSaving = money(bankBalance + cashBalance);

  const cards = [
    {
      title: "Cash Balance",
      value: cashBalance,
      icon: "💵",
      className: "cash-card",
    },
    {
      title: "Bank Balance",
      value: bankBalance,
      icon: "🏦",
      className: "bank-card",
    },
    {
      title: "Investment Balance",
      value: investmentBalance,
      icon: "📈",
      className: "investment-card",
    },
    {
      title: "Total Saving",
      value: totalSaving,
      icon: "💰",
      className: "total-card",
    },
  ];

  const closeIncome = async () => {
    setShowIncome(false);
    await loadData();
  };

  const closeExpense = async () => {
    setShowExpense(false);
    await loadData();
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header home-hero">
          <div>
            <h1>🏠 Home Dashboard</h1>
            <p>Cash, Bank, Investment and quick income / expense actions</p>
          </div>
        </section>

        <section className="home-summary-grid">
          {cards.map((item) => (
            <div className={`home-summary-card ${item.className}`} key={item.title}>
              <div className="summary-top">
                <span>{item.icon}</span>
                <p>{item.title}</p>
              </div>

              <h2>
                {symbol}
                {item.value.toFixed(2)}
              </h2>
            </div>
          ))}
        </section>

        <section className="home-action-grid">
          <div className="home-action-card income-action">
            <div>
              <h2>💰 Add Income</h2>
              <p>Add salary, business income, returned money or other income.</p>
            </div>

            <Button
              label="Add Income"
              icon="pi pi-plus"
              severity="success"
              className="w-full"
              onClick={() => setShowIncome(true)}
            />
          </div>

          <div className="home-action-card expense-action">
            <div>
              <h2>💸 Add Expense</h2>
              <p>Add grocery, rent, bills, personal use, car expenses and more.</p>
            </div>

            <Button
              label="Add Expense"
              icon="pi pi-minus"
              severity="danger"
              className="w-full"
              onClick={() => setShowExpense(true)}
            />
          </div>
        </section>

        <Dialog
          header="💰 Add Income"
          visible={showIncome}
          modal
          style={{ width: "95%", maxWidth: "720px" }}
          onHide={closeIncome}
        >
          <AddIncome
            userId={userId}
            fetchData={async () => {
              await loadData();
              setShowIncome(false);
            }}
          />
        </Dialog>

        <Dialog
          header="💸 Add Expense"
          visible={showExpense}
          modal
          style={{ width: "95%", maxWidth: "720px" }}
          onHide={closeExpense}
        >
          <AddExpense
            userId={userId}
            fetchData={async () => {
              await loadData();
              setShowExpense(false);
            }}
          />
        </Dialog>
      </main>
    </div>
  );
}

export default HomePage;