import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import "./PageLayout.css";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

function TransferPage({ goPage }) {
  const toast = useRef(null);

  const [list, setList] = useState([]);
  const [amount, setAmount] = useState(null);
  const [fromAccount, setFromAccount] = useState("CASH");
  const [toAccount, setToAccount] = useState("BANK");
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState("");

  const [summary, setSummary] = useState({
    cashBalance: 0,
    bankBalance: 0,
    investmentBalance: 0,
    totalBalance: 0,
  });

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  const userCurrency = (
    user?.currency ||
    localStorage.getItem("userCurrency") ||
    "INR"
  ).toUpperCase();

  const currencyOptions = [
    { code: "INR", symbol: "₹" },
    { code: "CAD", symbol: "C$" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "AUD", symbol: "A$" },
    { code: "NZD", symbol: "NZ$" },
    { code: "SGD", symbol: "S$" },
    { code: "AED", symbol: "AED " },
    { code: "JPY", symbol: "¥" },
  ];

  const accountOptions = [
    { label: "Cash", value: "CASH" },
    { label: "Bank", value: "BANK" },
    { label: "Investment", value: "INVESTMENT" },
  ];

  const getCurrencySymbol = (code) => {
    const found = currencyOptions.find((item) => item.code === code);
    return found ? found.symbol : `${code} `;
  };

  const getAccountLabel = (value) => {
    if (value === "CASH") return "Cash";
    if (value === "BANK") return "Bank";
    if (value === "INVESTMENT") return "Investment";
    return value;
  };

  const currencySymbol = getCurrencySymbol(userCurrency);

  useEffect(() => {
    if (userId) {
      refreshPage();
    }
  }, [userId]);

  const formatDateForApi = (value) => {
    if (!value) return null;
    const d = new Date(value);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const showSuccess = (detail) => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail,
    });
  };

  const showError = (detail) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail,
    });
  };

  const buildSummary = (transactionList, transferList) => {
    let cash = 0;
    let bank = 0;
    let investment = 0;

    transactionList.forEach((t) => {
      const amount = Number(t.amount || 0);
      const type = (t.type || "").toUpperCase();
      const method = (t.paymentMethod || t.account || "").toUpperCase();

      if (method === "CASH") {
        if (type === "INCOME") cash += amount;
        else if (type === "EXPENSE") cash -= amount;
      } else if (method === "BANK") {
        if (type === "INCOME") bank += amount;
        else if (type === "EXPENSE") bank -= amount;
      } else if (method === "INVESTMENT") {
        if (type === "INCOME") investment += amount;
        else if (type === "EXPENSE") investment -= amount;
      }
    });

    transferList.forEach((tr) => {
      const amount = Number(tr.amount || 0);
      const from = (tr.fromAccount || "").toUpperCase();
      const to = (tr.toAccount || "").toUpperCase();

      if (from === "CASH") cash -= amount;
      else if (from === "BANK") bank -= amount;
      else if (from === "INVESTMENT") investment -= amount;

      if (to === "CASH") cash += amount;
      else if (to === "BANK") bank += amount;
      else if (to === "INVESTMENT") investment += amount;
    });

    setSummary({
      cashBalance: cash,
      bankBalance: bank,
      investmentBalance: investment,
      // IMPORTANT: only Cash + Bank
      totalBalance: cash + bank,
    });
  };

  const refreshPage = async () => {
    try {
      const [transferRes, transactionRes] = await Promise.all([
        API.get(`/transfers/user/${userId}`),
        API.get(`/transactions/user/${userId}`),
      ]);

      const transferList = transferRes.data || [];
      const transactionList = transactionRes.data || [];

      setList(transferList);
      buildSummary(transactionList, transferList);
    } catch (err) {
      console.error("Error refreshing page:", err);
      showError("Failed to load transfer page data");
    }
  };

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      showError("Enter valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      showError("From account and To account cannot be same");
      return;
    }

    try {
      await API.post("/transfers", {
        amount: Number(amount),
        fromAccount,
        toAccount,
        date: formatDateForApi(date),
        note,
        user: { id: userId },
      });

      setAmount(null);
      setFromAccount("CASH");
      setToAccount("BANK");
      setDate(new Date());
      setNote("");

      await refreshPage();
      showSuccess("Transfer saved successfully");
    } catch (err) {
      console.error("Error saving transfer:", err);
      showError(err?.response?.data?.message || "Failed to save transfer");
    }
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this transfer?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await API.delete(`/transfers/${id}`);
          await refreshPage();
          showSuccess("Transfer deleted successfully");
        } catch (err) {
          console.error("Error deleting transfer:", err);
          showError("Failed to delete transfer");
        }
      },
    });
  };

  const actionBody = (rowData) => (
    <Button
      label="Delete"
      icon="pi pi-trash"
      severity="danger"
      outlined
      size="small"
      onClick={() => handleDelete(rowData.id)}
    />
  );

  const amountBody = (rowData) => (
    <span style={{ fontWeight: 700 }}>
      {currencySymbol}
      {Number(rowData.amount || 0)}
    </span>
  );

  return (
    <div className="page-layout">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🏦 Transfer Money</h1>
          <p>Transfer between Cash, Bank and Investment</p>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <Card>
              <h3 style={{ marginTop: 0 }}>Cash Balance</h3>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                {currencySymbol}
                {Number(summary.cashBalance || 0)}
              </p>
            </Card>

            <Card>
              <h3 style={{ marginTop: 0 }}>Bank Balance</h3>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                {currencySymbol}
                {Number(summary.bankBalance || 0)}
              </p>
            </Card>

            <Card>
              <h3 style={{ marginTop: 0 }}>Investment Balance</h3>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                {currencySymbol}
                {Number(summary.investmentBalance || 0)}
              </p>
            </Card>

            <Card>
              <h3 style={{ marginTop: 0 }}>Total Balance</h3>
              <p style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                {currencySymbol}
                {Number(summary.totalBalance || 0)}
              </p>
              <small style={{ color: "#64748b" }}>Cash + Bank only</small>
            </Card>
          </div>
        </section>

        <section className="page-box">
          <h2 style={{ marginTop: 0, marginBottom: "18px" }}>Add Transfer</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            <span className="p-float-label">
              <InputNumber
                id="amount"
                value={amount}
                onValueChange={(e) => setAmount(e.value)}
                mode="decimal"
                min={0}
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
              <label htmlFor="amount">Amount ({currencySymbol})</label>
            </span>

            <span className="p-float-label">
              <Dropdown
                id="fromAccount"
                value={fromAccount}
                options={accountOptions}
                onChange={(e) => setFromAccount(e.value)}
                style={{ width: "100%" }}
              />
              <label htmlFor="fromAccount">From Account</label>
            </span>

            <span className="p-float-label">
              <Dropdown
                id="toAccount"
                value={toAccount}
                options={accountOptions}
                onChange={(e) => setToAccount(e.value)}
                style={{ width: "100%" }}
              />
              <label htmlFor="toAccount">To Account</label>
            </span>

            <span className="p-float-label">
              <Calendar
                id="date"
                value={date}
                onChange={(e) => setDate(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
              <label htmlFor="date">Date</label>
            </span>
          </div>

          <div style={{ marginTop: "14px" }}>
            <span className="p-float-label">
              <InputTextarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                autoResize
                style={{ width: "100%" }}
              />
              <label htmlFor="note">Note</label>
            </span>
          </div>

          <div style={{ marginTop: "18px" }}>
            <Button
              label="Save Transfer"
              icon="pi pi-check"
              onClick={handleSave}
            />
          </div>
        </section>

        <section className="page-box">
          <h2 style={{ marginTop: 0, marginBottom: "18px" }}>
            Transfer History
          </h2>

          <DataTable
            value={list}
            paginator
            rows={8}
            stripedRows
            responsiveLayout="scroll"
            emptyMessage="No transfer records found"
            tableStyle={{ minWidth: "900px" }}
          >
            <Column field="date" header="Date" sortable />
            <Column header="Amount" body={amountBody} sortable />
            <Column
              field="fromAccount"
              header="From"
              body={(rowData) => getAccountLabel(rowData.fromAccount)}
              sortable
            />
            <Column
              field="toAccount"
              header="To"
              body={(rowData) => getAccountLabel(rowData.toAccount)}
              sortable
            />
            <Column
              field="note"
              header="Note"
              body={(rowData) => rowData.note || "-"}
            />
            <Column header="Action" body={actionBody} />
          </DataTable>
        </section>
      </main>
    </div>
  );
}

export default TransferPage;