import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import "./PageLayout.css";
import "./BillsPage.css";

function BillsPage({ goPage }) {
  const [billRecords, setBillRecords] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    type: "EXPENSE",
    category: "Personal Use",
    account: "BANK",
    amount: "",
    date: "",
    notes: "",
    bill: null,
  });

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;
  const symbol = getUserCurrencySymbol();

  useEffect(() => {
    if (userId) {
      fetchBills();
    }
  }, [userId]);

  const fetchBills = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const all = normalizeTransactions(res.data);

      const filtered = all.filter(
        (t) =>
          String(t.type).toUpperCase() === "EXPENSE" &&
          (t.category === "Personal Use" || t.category === "Car")
      );

      setBillRecords(filtered);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  const getBadgeStyle = (value) => {
    if (value === "Personal Use") {
      return {
        background: "#ede9fe",
        color: "#6d28d9",
      };
    }

    if (value === "Car") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      background: "#e2e8f0",
      color: "#334155",
    };
  };

  const openEditModal = (item) => {
    setEditData({
      id: item.id,
      type: "EXPENSE",
      category: item.category || "Personal Use",
      account: item.account || "BANK",
      amount: item.amount || "",
      date: item.date || "",
      notes: item.notes || "",
      bill: item.bill || null,
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditData({
      id: null,
      type: "EXPENSE",
      category: "Personal Use",
      account: "BANK",
      amount: "",
      date: "",
      notes: "",
      bill: null,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleBillFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertFileToBase64(file);
      setEditData((prev) => ({
        ...prev,
        bill: base64,
      }));
    } catch (err) {
      console.error("Error converting file:", err);
      alert("Failed to read image");
    }
  };

  const removeBillImage = () => {
    setEditData((prev) => ({
      ...prev,
      bill: null,
    }));
  };

  const handleUpdate = async () => {
    if (!editData.amount || Number(editData.amount) <= 0) {
      alert("Please enter valid amount");
      return;
    }

    if (!editData.date) {
      alert("Please select date");
      return;
    }

    if (
      editData.category === "Personal Use" &&
      !editData.notes.trim() &&
      !editData.bill
    ) {
      alert("For Personal Use, add note or image");
      return;
    }

    if (editData.category === "Car" && !editData.notes.trim()) {
      alert("Please enter car note/details");
      return;
    }

    try {
      await API.put(`/transactions/${editData.id}`, {
        id: editData.id,
        type: "EXPENSE",
        category: editData.category,
        account: editData.account,
        amount: Number(editData.amount),
        date: editData.date,
        notes: editData.notes.trim(),
        bill: editData.bill,
        user: {
          id: userId,
        },
      });

      closeEditModal();
      fetchBills();
      alert("Record updated successfully");
    } catch (err) {
      console.error("Error updating record:", err);
      alert("Failed to update record");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this record?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/transactions/${id}`);
      fetchBills();
      alert("Record deleted successfully");
    } catch (err) {
      console.error("Error deleting record:", err);
      alert("Failed to delete record");
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main
        className="page-main"
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
          minHeight: "100vh",
        }}
      >
        <section
          className="page-header"
          style={{
            background: "linear-gradient(135deg, #0f172a, #2563eb)",
            color: "#fff",
            borderRadius: "24px",
            padding: "28px",
            marginBottom: "24px",
            boxShadow: "0 12px 30px rgba(37, 99, 235, 0.25)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800" }}>
            🧾 Bills & Notes
          </h1>
          <p style={{ marginTop: "10px", marginBottom: 0, opacity: 0.95 }}>
            View, edit and delete your Personal Use and Car expenses
          </p>
        </section>

        <section
          className="page-box"
          style={{
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            border: "none",
          }}
        >
          {billRecords.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "40px 20px",
                textAlign: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                className="no-bills"
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                No Personal Use or Car bills found
              </p>
            </div>
          ) : (
            <div
              className="bills-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {billRecords.map((t) => {
                const badgeText =
                  t.category === "Car" ? "Car" : "Personal Use";
                const badgeStyle = getBadgeStyle(badgeText);

                return (
                  <div
                    key={t.id}
                    className="bill-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "22px",
                      padding: "22px",
                      boxShadow: "0 14px 35px rgba(15, 23, 42, 0.08)",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          fontWeight: "800",
                          color: "#0f172a",
                        }}
                      >
                        {t.category === "Car" ? "🚗 Car Expense" : "🛍 Personal Use"}
                      </h3>

                      <span
                        style={{
                          ...badgeStyle,
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {badgeText}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "10px",
                        marginBottom: "16px",
                      }}
                    >
                      <p style={{ margin: 0, color: "#334155" }}>
                        <b style={{ color: "#0f172a" }}>Type:</b> {t.type || "-"}
                      </p>

                      <p style={{ margin: 0, color: "#334155" }}>
                        <b style={{ color: "#0f172a" }}>Category:</b>{" "}
                        {t.category || "-"}
                      </p>

                      <p style={{ margin: 0, color: "#334155" }}>
                        <b style={{ color: "#0f172a" }}>Paid From:</b>{" "}
                        {t.account || "-"}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontWeight: "800",
                          fontSize: "18px",
                        }}
                      >
                        <b>Amount:</b> {symbol}
                        {t.amount}
                      </p>

                      <p style={{ margin: 0, color: "#334155" }}>
                        <b style={{ color: "#0f172a" }}>Date:</b> {t.date || "-"}
                      </p>

                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "14px",
                          padding: "12px",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            color: "#0f172a",
                            fontWeight: "700",
                          }}
                        >
                          Note
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: t.notes ? "#334155" : "#94a3b8",
                            lineHeight: "1.5",
                            wordBreak: "break-word",
                          }}
                        >
                          {t.notes && t.notes.trim() ? t.notes : "No note added"}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "10px",
                      }}
                    >
                      {t.bill ? (
                        <button
                          onClick={() => setPreviewImage(t.bill)}
                          style={{
                            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                            color: "#fff",
                            border: "none",
                            padding: "11px 16px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "700",
                          }}
                        >
                          View Bill Image
                        </button>
                      ) : (
                        <div
                          style={{
                            background: "#fff7ed",
                            color: "#c2410c",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            border: "1px solid #fed7aa",
                          }}
                        >
                          No bill image
                        </div>
                      )}

                      <button
                        onClick={() => openEditModal(t)}
                        style={{
                          background: "#f59e0b",
                          color: "#fff",
                          border: "none",
                          padding: "11px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(t.id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          padding: "11px 16px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: "22px",
              padding: "20px",
              maxWidth: "900px",
              width: "100%",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontSize: "22px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              ×
            </button>

            <img
              src={previewImage}
              alt="Bill Preview"
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "14px",
                marginTop: "20px",
              }}
            />
          </div>
        </div>
      )}

      {editModalOpen && (
        <div
          onClick={closeEditModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "#fff",
              borderRadius: "22px",
              padding: "24px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h2 style={{ margin: 0, color: "#0f172a" }}>Edit Bill Record</h2>
              <button
                onClick={closeEditModal}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                  }}
                >
                  <option value="Personal Use">Personal Use</option>
                  <option value="Car">Car</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Paid From
                </label>
                <select
                  name="account"
                  value={editData.account}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                  }}
                >
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={editData.amount}
                  onChange={handleEditChange}
                  placeholder="Enter amount"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={editData.date}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Note
                </label>
                <textarea
                  name="notes"
                  value={editData.notes}
                  onChange={handleEditChange}
                  placeholder={
                    editData.category === "Car"
                      ? "Write service, insurance, fuel, repair..."
                      : "Write your personal use note..."
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "700",
                    color: "#334155",
                  }}
                >
                  Upload Bill Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBillFileChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "15px",
                    background: "#fff",
                  }}
                />
              </div>

              {editData.bill && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    padding: "14px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    Current Bill Image
                  </p>
                  <img
                    src={editData.bill}
                    alt="Current Bill"
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      marginBottom: "10px",
                    }}
                  />
                  <button
                    onClick={removeBillImage}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={closeEditModal}
                  style={{
                    background: "#cbd5e1",
                    color: "#0f172a",
                    border: "none",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdate}
                  style={{
                    background: "linear-gradient(135deg, #16a34a, #059669)",
                    color: "#fff",
                    border: "none",
                    padding: "12px 18px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Update Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillsPage;