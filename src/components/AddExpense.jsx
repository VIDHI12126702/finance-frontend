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

function AddExpense({ fetchData, userId }) {
  const [amount, setAmount] = useState(null);
  const [category, setCategory] = useState("Rent");
  const [account, setAccount] = useState("BANK");
  const [notes, setNotes] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const expenseOptions = [
    { label: "Home Bill", value: "Home Bill" },
    { label: "Phone Bill", value: "Phone Bill" },
    { label: "Rent", value: "Rent" },
    { label: "Grocery", value: "Grocery" },
    { label: "Credit Bill", value: "Credit Bill" },
    { label: "Personal Use", value: "Personal Use" },
    { label: "Car", value: "Car" },
    { label: "Money Give", value: "Money Give" },
  ];

  const accountOptions = [
    { label: "Bank", value: "BANK" },
    { label: "Cash", value: "CASH" },
    { label: "Investment", value: "INVESTMENT" },
  ];

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      setBillFile(null);
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setBillFile(base64);
    } catch (error) {
      console.error("File convert error:", error);
      setMsg({ type: "error", text: "Failed to read image file." });
    }
  };

  const resetForm = () => {
    setAmount(null);
    setCategory("Rent");
    setAccount("BANK");
    setNotes("");
    setBillFile(null);
    setDate(new Date());
  };

  const handleAdd = async () => {
    setMsg(null);

    const cleanAmount = toMoneyNumber(amount);

    if (!userId) {
      setMsg({ type: "error", text: "User not found. Please login again." });
      return;
    }

    if (cleanAmount <= 0) {
      setMsg({ type: "error", text: "Please enter a valid expense amount." });
      return;
    }

    if (category === "Personal Use" && !notes.trim() && !billFile) {
      setMsg({
        type: "error",
        text: "For Personal Use, please add a note or upload an image.",
      });
      return;
    }

    if (category === "Car" && !notes.trim()) {
      setMsg({
        type: "error",
        text: "For Car, please write a note.",
      });
      return;
    }

    if (category === "Money Give" && !notes.trim()) {
      setMsg({
        type: "error",
        text: "For Money Give, please write a note.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        type: "EXPENSE",
        category,
        account,
        amount: cleanAmount,
        notes: notes.trim(),
        bill: billFile,
        date: formatDate(date),
        user: { id: userId },
      };

      await API.post("/transactions", payload);

      resetForm();
      setMsg({ type: "success", text: "Expense added successfully." });
      fetchData?.();
    } catch (error) {
      console.error("Add expense error:", error);
      setMsg({
        type: "error",
        text: error?.response?.data?.message || "Failed to add expense.",
      });
    } finally {
      setLoading(false);
    }
  };

  const showPersonalUseExtra = category === "Personal Use";
  const showCarNote = category === "Car";
  const showMoneyGiveNote = category === "Money Give";

  return (
    <Card title="Add Expense" className="shadow-2 border-round-2xl responsive-card">
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
          <label className="block mb-2 font-medium">Category</label>
          <Dropdown
            value={category}
            options={expenseOptions}
            onChange={(e) => {
              setCategory(e.value);
              setNotes("");
              setBillFile(null);
            }}
            placeholder="Select category"
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6">
          <label className="block mb-2 font-medium">Paid From</label>
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
            className="w-full"
          />
        </div>

        <div className="col-12">
          <label className="block mb-2 font-medium">Notes</label>
          <InputTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={
              showCarNote
                ? "Example: Petrol, service, repair"
                : showMoneyGiveNote
                ? "Example: Money given to friend"
                : "Write note"
            }
            className="w-full"
            autoResize
          />
        </div>

        {showPersonalUseExtra && (
          <div className="col-12">
            <label className="block mb-2 font-medium">Upload Bill Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-inputtext"
            />

            {billFile && (
              <div className="mt-3">
                <img
                  src={billFile}
                  alt="Bill Preview"
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "contain",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Button
                  label="Remove Image"
                  icon="pi pi-times"
                  severity="danger"
                  outlined
                  className="mt-2 w-full"
                  onClick={() => setBillFile(null)}
                />
              </div>
            )}
          </div>
        )}

        <div className="col-12">
          <Button
            label={loading ? "Adding..." : "Add Expense"}
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

export default AddExpense;