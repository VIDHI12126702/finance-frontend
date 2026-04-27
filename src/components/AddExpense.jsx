import { useState } from "react";
import { Card } from "primereact/card";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import API from "../api";

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
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

    if (!userId) {
      setMsg({ type: "error", text: "User not found. Please login again." });
      return;
    }

    if (!amount || amount <= 0) {
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
        amount,
        notes,
        bill: billFile,
        date: formatDate(date),
        user: { id: userId },
      };

      await API.post("/transactions", payload);

      resetForm();
      setMsg({ type: "success", text: "Expense added successfully." });

      if (fetchData) {
        fetchData();
      }
    } catch (error) {
      console.error("Add expense error:", error);
      setMsg({ type: "error", text: "Failed to add expense." });
    } finally {
      setLoading(false);
    }
  };

  const showPersonalUseExtra = category === "Personal Use";
  const showCarNote = category === "Car";
  const showMoneyGiveNote = category === "Money Give";

  return (
    <Card title="Add Expense" className="shadow-2 border-round-2xl">
      <div className="grid">
        <div className="col-12 md:col-6">
          <label className="block mb-2 font-medium">Amount</label>
          <InputNumber
            value={amount}
            onValueChange={(e) => setAmount(e.value)}
            mode="decimal"
            min={0}
            placeholder="Enter expense amount"
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

        {showPersonalUseExtra && (
          <>
            <div className="col-12">
              <label className="block mb-2 font-medium">
                Note for Personal Use
              </label>
              <InputTextarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Write personal use note"
                className="w-full"
                autoResize
              />
            </div>

            <div className="col-12">
              <label className="block mb-2 font-medium">
                Upload Image for Personal Use
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  background: "#fff",
                }}
              />
              {billFile && (
                <p style={{ marginTop: "8px", color: "green", fontWeight: 600 }}>
                  Image selected successfully
                </p>
              )}
            </div>
          </>
        )}

        {showCarNote && (
          <div className="col-12">
            <label className="block mb-2 font-medium">Car Note</label>
            <InputTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Write fuel, repair, insurance, service details"
              className="w-full"
              autoResize
            />
          </div>
        )}

        {showMoneyGiveNote && (
          <div className="col-12">
            <label className="block mb-2 font-medium">Money Give Note</label>
            <InputTextarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Write whom you gave money to and reason"
              className="w-full"
              autoResize
            />
          </div>
        )}

        <div className="col-12">
          <Button
            label={loading ? "Adding..." : "Add Expense"}
            icon="pi pi-minus"
            onClick={handleAdd}
            loading={loading}
            className="w-full p-button-danger"
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