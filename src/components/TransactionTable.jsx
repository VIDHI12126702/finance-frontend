import { useEffect, useState } from "react";
import API from "../api";
import "./TransactionTable.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function TransactionTable({ transactions, fetchData }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [editTransaction, setEditTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState("");
  const [editBill, setEditBill] = useState(null);

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

  useEffect(() => {
    if (editTransaction) {
      setEditAmount(editTransaction.amount || "");
      setEditCategory(editTransaction.category || "");
      setEditType(editTransaction.type || "");
      setEditBill(editTransaction.bill || null);
    }
  }, [editTransaction]);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const openEditModal = (t) => {
    setEditTransaction(t);
  };

  const closeEditModal = () => {
    setEditTransaction(null);
    setEditAmount("");
    setEditCategory("");
    setEditType("");
    setEditBill(null);
  };

  const handleEditSave = async () => {
    if (!editTransaction) return;

    if (!editAmount) {
      alert("Please enter amount");
      return;
    }

    let finalType = editType;
    let finalCategory = editCategory;
    let finalBill = editBill;

    if (editTransaction.type === "Income") {
      finalType = "Income";
      finalCategory = "Income";
      finalBill = null;
    } else {
      if (!editCategory) {
        alert("Please select category");
        return;
      }

      if (editCategory === "Investment") {
        finalType = "Investment";
      } else if (editCategory === "Personal Use") {
        finalType = "Personal Use";
      } else {
        finalType = "Expense";
      }

      if (finalCategory === "Personal Use" && !finalBill) {
        alert("Please upload bill image for Personal Use");
        return;
      }

      if (finalCategory !== "Personal Use") {
        finalBill = null;
      }
    }

    try {
      await API.put(`/transactions/${editTransaction.id}`, {
        ...editTransaction,
        amount: Number(editAmount),
        type: finalType,
        category: finalCategory,
        bill: finalBill,
      });

      closeEditModal();
      fetchData();
    } catch (err) {
      console.error("Error updating transaction:", err);
      alert("Failed to update transaction");
    }
  };

  if (transactions.length === 0) {
    return <p className="no-data">No Data Found</p>;
  }

  return (
    <div>
      <div className="transaction-list">
        {transactions.map((t) => (
          <div key={t.id} className="transaction-item">
            <div className="transaction-left">
              <p className="transaction-type">{t.type}</p>
              <p className="transaction-category">
                Category: {t.category ? t.category : "-"}
              </p>
              <p className="transaction-date">{t.date}</p>
            </div>

            <p className="transaction-amount">
              {symbol}
              {t.amount}
            </p>

            <div className="transaction-actions">
              {t.type === "Personal Use" && t.bill && (
                <button
                  className="view-btn"
                  onClick={() => setPreviewImage(t.bill)}
                >
                  View Bill
                </button>
              )}

              <button className="edit-btn" onClick={() => openEditModal(t)}>
                Edit
              </button>

              <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div
          className="image-modal-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => setPreviewImage(null)}
            >
              ×
            </button>
            <img src={previewImage} alt="Bill Preview" className="preview-image" />
          </div>
        </div>
      )}

      {editTransaction && (
        <div className="image-modal-overlay" onClick={closeEditModal}>
          <div
            className="image-modal-content edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal-btn" onClick={closeEditModal}>
              ×
            </button>

            <h2 className="edit-title">Edit Transaction</h2>

            <input
              className="edit-input"
              type="number"
              placeholder={`Enter amount (${symbol.trim()})`}
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
            />

            {editTransaction.type !== "Income" && (
              <>
                <select
                  className="edit-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  {expenseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {editCategory === "Personal Use" && (
                  <>
                    <label className="edit-label">Upload Bill Image</label>
                    <input
                      className="edit-input"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const base64 = await convertFileToBase64(e.target.files[0]);
                          setEditBill(base64);
                        }
                      }}
                    />
                  </>
                )}
              </>
            )}

            <button className="save-btn" onClick={handleEditSave}>
              Update Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionTable;