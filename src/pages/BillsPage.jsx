import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import { formatMoney } from "../utils/moneyUtils";
import "./PageLayout.css";
import "./BillsPage.css";

function BillsPage({ goPage, activePage }) {
  const [billRecords, setBillRecords] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;
  const symbol = getUserCurrencySymbol();

  useEffect(() => {
    if (userId) fetchBills();
  }, [userId]);

  const fetchBills = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const all = normalizeTransactions(res.data || []);

      const filtered = all.filter(
        (t) =>
          String(t.type).toUpperCase() === "EXPENSE" &&
          (t.category === "Personal Use" || t.category === "Car")
      );

      setBillRecords(filtered);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setBillRecords([]);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      await API.delete(`/transactions/${id}`);
      fetchBills();
      alert("Record deleted successfully");
    } catch (err) {
      console.error("Delete bill error:", err);
      alert("Failed to delete record");
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} activePage={activePage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🧾 Personal Bills</h1>
          <p>View Personal Use and Car expense bills</p>
        </section>

        <section className="page-box">
          {billRecords.length === 0 ? (
            <p className="no-bills">No Personal Use or Car bills found.</p>
          ) : (
            <div className="bills-grid">
              {billRecords.map((t) => (
                <div className="bill-card" key={t.id}>
                  <h3>{t.category === "Car" ? "🚗 Car Expense" : "🛍 Personal Use"}</h3>

                  <p>
                    <b>Category:</b> {t.category || "-"}
                  </p>

                  <p>
                    <b>Paid From:</b> {t.account || "-"}
                  </p>

                  <p>
                    <b>Amount:</b> {symbol}
                    {formatMoney(t.amount)}
                  </p>

                  <p>
                    <b>Date:</b> {t.date || "-"}
                  </p>

                  <p>
                    <b>Note:</b> {t.notes || "-"}
                  </p>

                  {t.bill ? (
                    <button className="bill-view-btn" onClick={() => setPreviewImage(t.bill)}>
                      View Bill Image
                    </button>
                  ) : (
                    <p className="no-image-text">No image uploaded</p>
                  )}

                  <button
                    className="bill-view-btn"
                    style={{ background: "#ef4444", marginTop: "8px" }}
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {previewImage && (
          <div className="image-modal-overlay" onClick={() => setPreviewImage(null)}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setPreviewImage(null)}>
                ×
              </button>
              <img src={previewImage} alt="Bill Preview" className="preview-image" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BillsPage;