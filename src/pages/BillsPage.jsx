import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import { normalizeTransactions } from "../utils/transactionUtils";
import "./PageLayout.css";
import "./BillsPage.css";

function BillsPage({ goPage }) {
  const [personalBills, setPersonalBills] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchBills();
    }
  }, [userId]);

  const fetchBills = async () => {
    try {
      const res = await API.get(`/transactions/user/${userId}`);
      const all = normalizeTransactions(res.data);
      const filtered = all.filter((t) => t.type === "Personal Use");
      setPersonalBills(filtered);
    } catch (err) {
      console.error("Error fetching personal bills:", err);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>🧾 Personal Use Bills</h1>
          <p>Check your personal use history and bill images</p>
        </section>

        <section className="page-box">
          {personalBills.length === 0 ? (
            <p className="no-bills">No personal bills found</p>
          ) : (
            <div className="bills-grid">
              {personalBills.map((t) => (
                <div key={t.id} className="bill-card">
                  <p>
                    <b>Type:</b> {t.type}
                  </p>
                  <p>
                    <b>Category:</b> {t.category ? t.category : "-"}
                  </p>
                  <p>
                    <b>Amount:</b> ${t.amount}
                  </p>
                  <p>
                    <b>Date:</b> {t.date}
                  </p>

                  {t.bill ? (
                    <button
                      className="bill-view-btn"
                      onClick={() => setPreviewImage(t.bill)}
                    >
                      View Bill Image
                    </button>
                  ) : (
                    <p className="no-image-text">No bill image uploaded</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {previewImage && (
        <div className="image-modal-overlay" onClick={() => setPreviewImage(null)}>
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
    </div>
  );
}

export default BillsPage;