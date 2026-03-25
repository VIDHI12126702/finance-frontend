import { useState } from "react";
import API from "../api";
import "./Form.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function AddExpense({ fetchData, userId }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Rent");
  const [billFile, setBillFile] = useState(null);
  const symbol = getUserCurrencySymbol();

  const expenseOptions = [
    "Rent",
    "Grocery",
    "Home Bill",
    "Phone Bill",
    "Investment",
    "Personal Use",
    "Travel",
  ];

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAdd = async () => {
    if (!amount) {
      alert("Please enter amount");
      return;
    }

    if (category === "Personal Use" && !billFile) {
      alert("Please upload bill image for Personal Use");
      return;
    }

    const today = new Date();
    let billImage = null;

    let type = "Expense";
    if (category === "Investment") {
      type = "Investment";
    } else if (category === "Personal Use") {
      type = "Personal Use";
    }

    try {
      if (category === "Personal Use" && billFile) {
        billImage = await convertFileToBase64(billFile);
      }

      await API.post("/transactions", {
        type,
        category,
        amount: Number(amount),
        date: today.toISOString().split("T")[0],
        month: today.getMonth(),
        year: today.getFullYear(),
        bill: billImage,
        user: {
          id: userId,
        },
      });

      setAmount("");
      setCategory("Rent");
      setBillFile(null);
      fetchData();
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to save expense");
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

      <select
        className="form-input"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {expenseOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {category === "Personal Use" && (
        <div className="bill-upload-box">
          <label className="bill-label">Upload Bill Image</label>
          <input
            className="form-input file-input"
            type="file"
            accept="image/*"
            onChange={(e) => setBillFile(e.target.files[0])}
          />
        </div>
      )}

      <button className="form-btn expense-btn" onClick={handleAdd}>
        Add Expense
      </button>
    </div>
  );
}

export default AddExpense;