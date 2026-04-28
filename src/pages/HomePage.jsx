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
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "./PageLayout.css";

function HomePage({ goPage, activePage }) {
  const [transactions, setTransactions] = useState([]);
  const [transfers, setTransfers] = useState([]);

  const [incomeDialog, setIncomeDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) refreshData();
  }, [userId]);

  const money = (value) => Number(Number(value || 0).toFixed(2));

  const refreshData = async () => {
    try {
      const [tRes, trRes] = await Promise.all([
        API.get(`/transactions/user/${userId}`),
        API.get(`/transfers/user/${userId}`),
      ]);

      setTransactions(normalizeTransactions(tRes.data || []));
      setTransfers(trRes.data || []);
    } catch (err) {
      console.error("Home load error:", err);
    }
  };

  const summary = calculateSummary(transactions);

  let cashBalance = money(summary.cashBalance);
  let bankBalance = money(summary.bankBalance);
  let investmentBalance = money(summary.investmentBalance);

  // transfer adjust
  transfers.forEach((tr) => {
    const amt = money(tr.amount);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "CASH") cashBalance -= amt;
    if (from === "BANK") bankBalance -= amt;
    if (from === "INVESTMENT") investmentBalance -= amt;

    if (to === "CASH") cashBalance += amt;
    if (to === "BANK") bankBalance += amt;
    if (to === "INVESTMENT") investmentBalance += amt;
  });

  const totalSaving = money(bankBalance + cashBalance);

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🏠 Home Dashboard</h1>
          <p>Quick overview + quick actions</p>
        </section>

        {/* SUMMARY */}
        <SummaryCards
          bankBalance={bankBalance}
          cashBalance={cashBalance}
          investmentBalance={investmentBalance}
          totalSaving={totalSaving}
        />

        {/* ACTION BUTTONS */}
        <section className="home-action-grid">
          <div className="action-card income-card">
            <h2>💰 Add Income</h2>
            <p>Add salary, return money, etc.</p>

            <Button
              label="Add Income"
              icon="pi pi-plus"
              severity="success"
              className="w-full"
              onClick={() => setIncomeDialog(true)}
            />
          </div>

          <div className="action-card expense-card">
            <h2>💸 Add Expense</h2>
            <p>Add bills, grocery, rent, etc.</p>

            <Button
              label="Add Expense"
              icon="pi pi-minus"
              severity="danger"
              className="w-full"
              onClick={() => setExpenseDialog(true)}
            />
          </div>
        </section>

        {/* POPUP INCOME */}
        <Dialog
          header="💰 Add Income"
          visible={incomeDialog}
          style={{ width: "95%", maxWidth: "650px" }}
          modal
          onHide={() => setIncomeDialog(false)}
        >
          <AddIncome
            userId={userId}
            fetchData={() => {
              refreshData();
              setIncomeDialog(false);
            }}
          />
        </Dialog>

        {/* POPUP EXPENSE */}
        <Dialog
          header="💸 Add Expense"
          visible={expenseDialog}
          style={{ width: "95%", maxWidth: "650px" }}
          modal
          onHide={() => setExpenseDialog(false)}
        >
          <AddExpense
            userId={userId}
            fetchData={() => {
              refreshData();
              setExpenseDialog(false);
            }}
          />
        </Dialog>
      </main>
    </div>
  );
}

export default HomePage;