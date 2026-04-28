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

function TransferPage({ goPage, activePage }) {
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

  const userCurrency = (user?.currency || "INR").toUpperCase();

  const currencyOptions = [
    { code: "INR", symbol: "₹" },
    { code: "CAD", symbol: "C$" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "GBP", symbol: "£" },
    { code: "AUD", symbol: "A$" },
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

  const currencySymbol = getCurrencySymbol(userCurrency);

  useEffect(() => {
    if (userId) refreshPage();
  }, [userId]);

  const money = (value) => Number(Number(value || 0).toFixed(2));

  const formatDateForApi = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
      2,
      "0"
    )}-${`${d.getDate()}`.padStart(2, "0")}`;
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
      const amt = money(t.amount);
      const type = (t.type || "").toUpperCase();
      const account = (t.account || t.paymentMethod || "").toUpperCase();

      if (account === "CASH") {
        if (type === "INCOME") cash += amt;
        if (type === "EXPENSE") cash -= amt;
      }

      if (account === "BANK") {
        if (type === "INCOME") bank += amt;
        if (type === "EXPENSE") bank -= amt;
      }

      if (account === "INVESTMENT") {
        if (type === "INCOME") investment += amt;
        if (type === "EXPENSE") investment -= amt;
      }
    });

    transferList.forEach((tr) => {
      const amt = money(tr.amount);
      const from = (tr.fromAccount || "").toUpperCase();
      const to = (tr.toAccount || "").toUpperCase();

      if (from === "CASH") cash -= amt;
      if (from === "BANK") bank -= amt;
      if (from === "INVESTMENT") investment -= amt;

      if (to === "CASH") cash += amt;
      if (to === "BANK") bank += amt;
      if (to === "INVESTMENT") investment += amt;
    });

    setSummary({
      cashBalance: money(cash),
      bankBalance: money(bank),
      investmentBalance: money(investment),
      totalBalance: money(cash + bank),
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
      console.error("Transfer page load error:", err);
      showError("Failed to load transfer data");
    }
  };

  const handleSave = async () => {
    const cleanAmount = money(amount);

    if (cleanAmount <= 0) {
      showError("Enter valid amount");
      return;
    }

    if (fromAccount === toAccount) {
      showError("From account and To account cannot be same");
      return;
    }

    try {
      await API.post("/transfers", {
        amount: cleanAmount,
        fromAccount,
        toAccount,
        date: formatDateForApi(date),
        note: note.trim(),
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
      console.error("Transfer save error:", err);
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
          console.error("Delete transfer error:", err);
          showError("Failed to delete transfer");
        }
      },
    });
  };

  const amountBody = (rowData) => (
    <b>
      {currencySymbol}
      {money(rowData.amount).toFixed(2)}
    </b>
  );

  const actionBody = (rowData) => (
    <Button
      icon="pi pi-trash"
      severity="danger"
      rounded
      outlined
      onClick={() => handleDelete(rowData.id)}
    />
  );

  return (
    <div className="page-layout">
      <Toast ref={toast} />
      <ConfirmDialog />

      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🏦 Transfer Money</h1>
          <p>Move money between Cash, Bank and Investment</p>
        </section>

        <div className="grid mb-4">
          <div className="col-12 md:col-6 xl:col-3">
            <Card className="shadow-2 border-round-2xl">
              <p className="text-700 font-medium">Cash Balance</p>
              <h2>
                {currencySymbol}
                {money(summary.cashBalance).toFixed(2)}
              </h2>
            </Card>
          </div>

          <div className="col-12 md:col-6 xl:col-3">
            <Card className="shadow-2 border-round-2xl">
              <p className="text-700 font-medium">Bank Balance</p>
              <h2>
                {currencySymbol}
                {money(summary.bankBalance).toFixed(2)}
              </h2>
            </Card>
          </div>

          <div className="col-12 md:col-6 xl:col-3">
            <Card className="shadow-2 border-round-2xl">
              <p className="text-700 font-medium">Investment Balance</p>
              <h2>
                {currencySymbol}
                {money(summary.investmentBalance).toFixed(2)}
              </h2>
            </Card>
          </div>

          <div className="col-12 md:col-6 xl:col-3">
            <Card className="shadow-2 border-round-2xl">
              <p className="text-700 font-medium">Total Saving</p>
              <h2>
                {currencySymbol}
                {money(summary.totalBalance).toFixed(2)}
              </h2>
            </Card>
          </div>
        </div>

        <section className="page-box">
          <h2 className="mt-0">Add Transfer</h2>

          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Amount</label>
              <InputNumber
                value={amount}
                onValueChange={(e) => setAmount(e.value)}
                mode="decimal"
                min={0}
                minFractionDigits={0}
                maxFractionDigits={2}
                inputMode="decimal"
                placeholder="Example: 12.30"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">From Account</label>
              <Dropdown
                value={fromAccount}
                options={accountOptions}
                onChange={(e) => setFromAccount(e.value)}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">To Account</label>
              <Dropdown
                value={toAccount}
                options={accountOptions}
                onChange={(e) => setToAccount(e.value)}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Date</label>
              <Calendar
                value={date}
                onChange={(e) => setDate(e.value)}
                dateFormat="dd/mm/yy"
                showIcon
                className="w-full"
              />
            </div>

            <div className="col-12">
              <label className="block mb-2 font-medium">Note</label>
              <InputTextarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                autoResize
                placeholder="Optional note"
                className="w-full"
              />
            </div>

            <div className="col-12">
              <Button
                label="Save Transfer"
                icon="pi pi-save"
                onClick={handleSave}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="page-box">
          <h2 className="mt-0">Transfer History</h2>

          <DataTable
            value={list}
            paginator
            rows={5}
            responsiveLayout="scroll"
            emptyMessage="No transfer records found."
          >
            <Column field="amount" header="Amount" body={amountBody} />
            <Column field="fromAccount" header="From" />
            <Column field="toAccount" header="To" />
            <Column field="date" header="Date" />
            <Column field="note" header="Note" />
            <Column header="Action" body={actionBody} />
          </DataTable>
        </section>
      </main>
    </div>
  );
}

export default TransferPage;