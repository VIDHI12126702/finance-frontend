import { useState } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import API from "../api";
import { toMoneyNumber } from "../utils/moneyUtils";
import { formatDateForApi, todayOnly, isFutureDate } from "../utils/dateUtils";

function AddIncome({ fetchData, userId }) {
  const [amount, setAmount] = useState(null);
  const [category, setCategory] = useState("Income");
  const [account, setAccount] = useState("BANK");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const incomeCategoryOptions = [
    { label: "Income", value: "Income" },
    { label: "Returned Money", value: "Returned Money" },
  ];

  const accountOptions = [
    { label: "Bank", value: "BANK" },
    { label: "Cash", value: "CASH" },
    { label: "Investment", value: "INVESTMENT" },
  ];

  const handleAdd = async () => {
    setMsg(null);

    const cleanAmount = toMoneyNumber(amount);

    if (!userId) {
      setMsg({ type: "error", text: "User not found. Please login again." });
      return;
    }

    if (cleanAmount <= 0) {
      setMsg({ type: "error", text: "Please enter a valid income amount." });
      return;
    }

    if (isFutureDate(date)) {
      setMsg({ type: "error", text: "Future date is not allowed." });
      return;
    }

    try {
      setLoading(true);

      await API.post("/transactions", {
        type: "INCOME",
        category,
        account,
        amount: cleanAmount,
        notes: notes.trim(),
        bill: null,
        date: formatDateForApi(date),
        user: { id: userId },
      });

      setAmount(null);
      setCategory("Income");
      setAccount("BANK");
      setNotes("");
      setDate(new Date());

      setMsg({ type: "success", text: "Income added successfully." });
      fetchData?.();
    } catch (error) {
      console.error("Add income error:", error);
      setMsg({
        type: "error",
        text: error?.response?.data?.message || "Failed to add income.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Add Income" className="shadow-2 border-round-2xl responsive-card">
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
          <label className="block mb-2 font-medium">Income Type</label>
          <Dropdown
            value={category}
            options={incomeCategoryOptions}
            onChange={(e) => setCategory(e.value)}
            placeholder="Select income type"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2 font-medium">Income To</label>
          <Dropdown
            value={account}
            options={accountOptions}
            onChange={(e) => setAccount(e.value)}
            placeholder="Select account"
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
            maxDate={todayOnly()}
            className="w-full"
          />
        </div>

        <div className="col-12">
          <label className="block mb-2 font-medium">Notes</label>
          <InputTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Example: Salary, business income, returned money"
            className="w-full"
            autoResize
          />
        </div>

        <div className="col-12">
          <Button
            label={loading ? "Adding..." : "Add Income"}
            icon="pi pi-plus"
            onClick={handleAdd}
            loading={loading}
            className="w-full"
          />
        </div>

        {msg && (
          <div className="col-12">
            <Message severity={msg.type} text={msg.text} className="w-full" />
          </div>
        )}
      </div>
    </Card>
  );
}

export default AddIncome;