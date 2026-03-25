import { useState } from "react";
import API from "../api";
import "./Form.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function AddIncome({ fetchData, userId }) {
  const [amount, setAmount] = useState("");
  const symbol = getUserCurrencySymbol();

  const handleAdd = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }

    const today = new Date();

    const payload = {
      type: "Income",
      category: "Income",
      amount: Number(amount),
      date: today.toISOString().split("T")[0],
      month: today.getMonth(),
      year: today.getFullYear(),
      bill: null,
      user: {
        id: userId,
      },
    };

    try {
      await API.post("/transactions", payload);
      setAmount("");
      fetchData();
    } catch (err) {
      console.error("Error:", err.response || err);
      alert("Failed to save income");
    }
  };

  return (
    <div>
      <input
        className="form-input"
        type="number"
        placeholder={`Enter amount (${symbol.trim()})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button className="form-btn income-btn" onClick={handleAdd}>
        Add Income
      </button>
    </div>
  );
}

export default AddIncome;