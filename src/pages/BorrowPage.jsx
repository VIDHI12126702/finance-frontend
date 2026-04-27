import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import "./PageLayout.css";

import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

function BorrowPage({ goPage }) {
  const toast = useRef(null);
  const dtPending = useRef(null);
  const dtReturned = useRef(null);

  const [list, setList] = useState([]);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState(null);
  const [type, setType] = useState("GIVE");
  const [currency, setCurrency] = useState("INR");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [date, setDate] = useState(new Date());

  const [searchName, setSearchName] = useState("");
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState("ALL");

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [returnAmount, setReturnAmount] = useState(null);
  const [returnPaymentMethod, setReturnPaymentMethod] = useState("CASH");
  const [returnDate, setReturnDate] = useState(new Date());
  const [returnNote, setReturnNote] = useState("");

  const currencyOptions = [
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$" },
    { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
    { code: "AED", label: "UAE Dirham", symbol: "AED " },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  ];

  const paymentOptions = [
    { code: "CASH", label: "Cash" },
    { code: "UPI", label: "UPI" },
    { code: "BANK_TRANSFER", label: "Bank Transfer" },
    { code: "CARD", label: "Card" },
  ];

  const typeOptions = [
    { label: "I Gave", value: "GIVE" },
    { label: "I Took", value: "TAKE" },
  ];

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const formatDateForApi = (value) => {
    if (!value) return null;
    const d = new Date(value);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const normalizeBorrowItem = (item) => {
    const totalAmount = Number(item.totalAmount ?? item.amount ?? 0);
    const returnedAmount = Number(item.returnedAmount ?? 0);
    const remainingAmount = Number(
      item.remainingAmount ?? Math.max(totalAmount - returnedAmount, 0)
    );

    let status = item.status;
    if (!status) {
      if (remainingAmount <= 0) {
        status = "RETURNED";
      } else if (returnedAmount > 0) {
        status = "PARTIAL";
      } else {
        status = "PENDING";
      }
    }

    return {
      ...item,
      totalAmount,
      returnedAmount,
      remainingAmount,
      status,
      returned: remainingAmount <= 0,
      returnNote: item.returnNote || item.note || "",
    };
  };

  const fetchData = async () => {
    try {
      const res = await API.get(`/borrow/user/${userId}`);
      const raw = res.data || [];
      setList(raw.map(normalizeBorrowItem));
    } catch (err) {
      console.error("Error fetching borrow/lend data:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load records",
      });
    }
  };

  const getCurrencySymbol = (code) => {
    const found = currencyOptions.find((item) => item.code === code);
    return found ? found.symbol : `${code} `;
  };

  const getCurrencyLabel = (code) => {
    const found = currencyOptions.find((item) => item.code === code);
    return found ? found.label : code;
  };

  const getPaymentLabel = (code) => {
    const found = paymentOptions.find((item) => item.code === code);
    return found ? found.label : code;
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

  const handleAdd = async () => {
    if (!personName.trim() || !amount || !paymentMethod || !date) {
      showError("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      showError("Amount must be greater than 0");
      return;
    }

    try {
      await API.post("/borrow", {
        personName: personName.trim(),
        amount: Number(amount),
        totalAmount: Number(amount),
        returnedAmount: 0,
        remainingAmount: Number(amount),
        status: "PENDING",
        type,
        currency,
        paymentMethod,
        date: formatDateForApi(date),
        user: { id: userId },
      });

      setPersonName("");
      setAmount(null);
      setType("GIVE");
      setCurrency("INR");
      setPaymentMethod("CASH");
      setDate(new Date());
      fetchData();
      showSuccess("Record added successfully");
    } catch (err) {
      console.error("Error saving borrow/lend data:", err);
      showError(err?.response?.data?.message || "Failed to save data");
    }
  };

  const openReturnModal = (item) => {
    setSelectedReturnItem(item);
    setReturnAmount(null);
    setReturnPaymentMethod("CASH");
    setReturnDate(new Date());
    setReturnNote("");
    setReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setSelectedReturnItem(null);
    setReturnAmount(null);
    setReturnPaymentMethod("CASH");
    setReturnDate(new Date());
    setReturnNote("");
    setReturnModalOpen(false);
  };

  const handleConfirmReturn = async () => {
    if (!selectedReturnItem) return;

    if (!returnAmount || Number(returnAmount) <= 0) {
      showError("Please enter valid return amount");
      return;
    }

    if (Number(returnAmount) > Number(selectedReturnItem.remainingAmount || 0)) {
      showError("Return amount cannot be greater than remaining amount");
      return;
    }

    try {
      await API.put(`/borrow/return/${selectedReturnItem.id}`, {
        returnAmount: String(Number(returnAmount)),
        returnPaymentMethod,
        returnDate: formatDateForApi(returnDate),
        note: returnNote,
      });

      closeReturnModal();
      fetchData();
      showSuccess("Return updated successfully");
    } catch (err) {
      console.error("Error updating return:", err);
      showError(err?.response?.data?.message || "Failed to update return");
    }
  };

  const handleDelete = async (id) => {
    confirmDialog({
      message: "Are you sure you want to delete this record?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await API.delete(`/borrow/${id}`);
          fetchData();
          showSuccess("Record deleted successfully");
        } catch (err) {
          console.error("Error deleting entry:", err);
          showError("Failed to delete data");
        }
      },
    });
  };

  const currencySummary = useMemo(() => {
    const summaryMap = {};

    list.forEach((item) => {
      const curr = (item.currency || "INR").toUpperCase();

      if (!summaryMap[curr]) {
        summaryMap[curr] = {
          currency: curr,
          totalGiven: 0,
          totalTaken: 0,
          totalReturnReceived: 0,
          totalPaidBack: 0,
          leftToReceive: 0,
          leftToPay: 0,
          count: 0,
        };
      }

      const entry = summaryMap[curr];
      entry.count += 1;

      if (item.type === "GIVE") {
        entry.totalGiven += Number(item.totalAmount || 0);
        entry.totalReturnReceived += Number(item.returnedAmount || 0);
        entry.leftToReceive += Number(item.remainingAmount || 0);
      } else {
        entry.totalTaken += Number(item.totalAmount || 0);
        entry.totalPaidBack += Number(item.returnedAmount || 0);
        entry.leftToPay += Number(item.remainingAmount || 0);
      }
    });

    return Object.values(summaryMap).sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
  }, [list]);

  const filteredPendingList = useMemo(() => {
    return list.filter((item) => {
      const matchesStatus = item.status !== "RETURNED";
      const matchesName = (item.personName || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());

      const matchesCurrency =
        selectedCurrencyFilter === "ALL" ||
        (item.currency || "").toUpperCase() === selectedCurrencyFilter;

      return matchesStatus && matchesName && matchesCurrency;
    });
  }, [list, searchName, selectedCurrencyFilter]);

  const filteredCompletedList = useMemo(() => {
    return list.filter((item) => {
      const matchesStatus = item.status === "RETURNED";
      const matchesName = (item.personName || "")
        .toLowerCase()
        .includes(searchName.toLowerCase());

      const matchesCurrency =
        selectedCurrencyFilter === "ALL" ||
        (item.currency || "").toUpperCase() === selectedCurrencyFilter;

      return matchesStatus && matchesName && matchesCurrency;
    });
  }, [list, searchName, selectedCurrencyFilter]);

  const amountBody = (rowData, field) => {
    return (
      <span style={{ fontWeight: 700 }}>
        {getCurrencySymbol(rowData.currency)}
        {Number(rowData[field] || 0)}
      </span>
    );
  };

  const typeBody = (rowData) => (
    <Tag
      value={rowData.type === "GIVE" ? "I Gave" : "I Took"}
      severity={rowData.type === "GIVE" ? "danger" : "info"}
    />
  );

  const statusBody = (rowData) => {
    let severity = "warning";
    let label = "Pending";

    if (rowData.status === "PARTIAL") {
      severity = "info";
      label = "Partial Return";
    }

    if (rowData.status === "RETURNED") {
      severity = "success";
      label = "Returned";
    }

    return <Tag value={label} severity={severity} />;
  };

  const actionBody = (rowData) => (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {rowData.remainingAmount > 0 && rowData.status !== "RETURNED" && (
        <Button
          label="Add Return"
          icon="pi pi-plus-circle"
          severity="warning"
          size="small"
          rounded
          onClick={() => openReturnModal(rowData)}
        />
      )}
      <Button
        label="Delete"
        icon="pi pi-trash"
        severity="danger"
        size="small"
        rounded
        outlined
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  const exportPendingCSV = () => {
    dtPending.current.exportCSV();
  };

  const exportReturnedCSV = () => {
    dtReturned.current.exportCSV();
  };

  return (
    <div className="page-layout">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Sidebar goPage={goPage} />

      <main
        className="page-main"
        style={{
          background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
          minHeight: "100vh",
          paddingBottom: "2rem",
        }}
      >
        <section
          className="page-header"
          style={{
            background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
            color: "#fff",
            borderRadius: "24px",
            padding: "26px",
            marginBottom: "24px",
            boxShadow: "0 14px 35px rgba(37, 99, 235, 0.22)",
          }}
        >
          <h1 style={{ margin: 0 }}>📊 Borrow / Lend Manager</h1>
          <p style={{ marginTop: "8px", marginBottom: 0, opacity: 0.95 }}>
            Table view with currency summary and filter buttons
          </p>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <h2 style={{ marginBottom: "16px", color: "#0f172a" }}>
            Currency Summary
          </h2>

          {currencySummary.length === 0 ? (
            <Card>
              <p style={{ margin: 0 }}>No summary available</p>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {currencySummary.map((item) => (
                <Card
                  key={item.currency}
                  style={{
                    borderRadius: "18px",
                    border: "1px solid #e5e7eb",
                    background:
                      selectedCurrencyFilter === item.currency
                        ? "linear-gradient(135deg, #dbeafe, #eff6ff)"
                        : "linear-gradient(135deg, #ffffff, #eff6ff)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{item.currency} Summary</h3>
                    <Tag value={getCurrencyLabel(item.currency)} severity="info" />
                  </div>

                  <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div>
                      <b>Total Given:</b> {getCurrencySymbol(item.currency)}
                      {item.totalGiven}
                    </div>
                    <div>
                      <b>Total Taken:</b> {getCurrencySymbol(item.currency)}
                      {item.totalTaken}
                    </div>
                    <div style={{ color: "#166534" }}>
                      <b>Return Received:</b> {getCurrencySymbol(item.currency)}
                      {item.totalReturnReceived}
                    </div>
                    <div style={{ color: "#2563eb" }}>
                      <b>Paid Back:</b> {getCurrencySymbol(item.currency)}
                      {item.totalPaidBack}
                    </div>
                    <div style={{ color: "#7c3aed" }}>
                      <b>Left To Receive:</b> {getCurrencySymbol(item.currency)}
                      {item.leftToReceive}
                    </div>
                    <div style={{ color: "#dc2626" }}>
                      <b>Left To Pay:</b> {getCurrencySymbol(item.currency)}
                      {item.leftToPay}
                    </div>
                    <div>
                      <b>Records:</b> {item.count}
                    </div>
                  </div>

                  <Button
                    label={
                      selectedCurrencyFilter === item.currency
                        ? `Showing ${item.currency}`
                        : `Show ${item.currency} Records`
                    }
                    icon="pi pi-filter"
                    severity={
                      selectedCurrencyFilter === item.currency
                        ? "success"
                        : "primary"
                    }
                    outlined={selectedCurrencyFilter !== item.currency}
                    style={{ width: "100%" }}
                    onClick={() => setSelectedCurrencyFilter(item.currency)}
                  />
                </Card>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: "24px" }}>
          <Card
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: "#0f172a" }}>Filter by Currency</h2>
                <p style={{ margin: "6px 0 0 0", color: "#64748b" }}>
                  Click button and show only that currency records
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button
                  label="All Currency"
                  icon="pi pi-list"
                  severity={
                    selectedCurrencyFilter === "ALL" ? "primary" : "secondary"
                  }
                  outlined={selectedCurrencyFilter !== "ALL"}
                  onClick={() => setSelectedCurrencyFilter("ALL")}
                />

                {currencySummary.map((item) => (
                  <Button
                    key={item.currency}
                    label={`${item.currency} (${item.count})`}
                    icon="pi pi-wallet"
                    severity={
                      selectedCurrencyFilter === item.currency
                        ? "success"
                        : "secondary"
                    }
                    outlined={selectedCurrencyFilter !== item.currency}
                    onClick={() => setSelectedCurrencyFilter(item.currency)}
                  />
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <Card
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: "18px", color: "#0f172a" }}>
              Add New Entry
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              <span className="p-float-label">
                <InputText
                  id="personName"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  style={{ width: "100%" }}
                />
                <label htmlFor="personName">Person Name</label>
              </span>

              <span className="p-float-label">
                <InputNumber
                  id="amount"
                  value={amount}
                  onValueChange={(e) => setAmount(e.value)}
                  mode="decimal"
                  min={0}
                  style={{ width: "100%" }}
                  inputStyle={{ width: "100%" }}
                />
                <label htmlFor="amount">Amount</label>
              </span>

              <span className="p-float-label">
                <Dropdown
                  id="type"
                  value={type}
                  options={typeOptions}
                  onChange={(e) => setType(e.value)}
                  style={{ width: "100%" }}
                />
                <label htmlFor="type">Type</label>
              </span>

              <span className="p-float-label">
                <Dropdown
                  id="currency"
                  value={currency}
                  options={currencyOptions.map((item) => ({
                    label: `${item.code} (${item.label})`,
                    value: item.code,
                  }))}
                  onChange={(e) => setCurrency(e.value)}
                  style={{ width: "100%" }}
                />
                <label htmlFor="currency">Currency</label>
              </span>

              <span className="p-float-label">
                <Dropdown
                  id="paymentMethod"
                  value={paymentMethod}
                  options={paymentOptions.map((item) => ({
                    label: item.label,
                    value: item.code,
                  }))}
                  onChange={(e) => setPaymentMethod(e.value)}
                  style={{ width: "100%" }}
                />
                <label htmlFor="paymentMethod">Payment Method</label>
              </span>

              <span className="p-float-label">
                <Calendar
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.value)}
                  dateFormat="yy-mm-dd"
                  showIcon
                  style={{ width: "100%" }}
                  inputStyle={{ width: "100%" }}
                />
                <label htmlFor="date">Date</label>
              </span>
            </div>

            <div style={{ marginTop: "18px" }}>
              <Button
                label="Add Record"
                icon="pi pi-plus"
                onClick={handleAdd}
                rounded
              />
            </div>
          </Card>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <Card
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ margin: 0, color: "#0f172a" }}>Search by Name</h2>

              <span
                className="p-input-icon-left"
                style={{ minWidth: "280px", flex: 1 }}
              >
                <i className="pi pi-search" />
                <InputText
                  placeholder="Search person name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </span>
            </div>
          </Card>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <Card
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Pending / Partial Records</h2>
                <p style={{ margin: "6px 0 0 0", color: "#64748b" }}>
                  Showing:{" "}
                  {selectedCurrencyFilter === "ALL"
                    ? "All Currency"
                    : selectedCurrencyFilter}
                </p>
              </div>

              <Button
                label="Export CSV"
                icon="pi pi-download"
                severity="success"
                outlined
                onClick={exportPendingCSV}
              />
            </div>

            <DataTable
              ref={dtPending}
              value={filteredPendingList}
              paginator
              rows={8}
              stripedRows
              responsiveLayout="scroll"
              emptyMessage="No pending records found"
              tableStyle={{ minWidth: "1300px" }}
            >
              <Column field="personName" header="Person Name" sortable />
              <Column header="Type" body={typeBody} />
              <Column field="currency" header="Currency" sortable />
              <Column
                field="paymentMethod"
                header="Original Method"
                body={(rowData) => getPaymentLabel(rowData.paymentMethod)}
              />
              <Column field="date" header="Entry Date" sortable />
              <Column
                header="Total Amount"
                body={(rowData) => amountBody(rowData, "totalAmount")}
                sortable
              />
              <Column
                header="Returned So Far"
                body={(rowData) => amountBody(rowData, "returnedAmount")}
                sortable
              />
              <Column
                header="Left Amount"
                body={(rowData) => amountBody(rowData, "remainingAmount")}
                sortable
              />
              <Column
                field="returnPaymentMethod"
                header="Last Return Method"
                body={(rowData) =>
                  rowData.returnedAmount > 0
                    ? getPaymentLabel(rowData.returnPaymentMethod)
                    : "-"
                }
              />
              <Column
                field="returnDate"
                header="Last Return Date"
                body={(rowData) =>
                  rowData.returnedAmount > 0 ? rowData.returnDate || "-" : "-"
                }
              />
              <Column
                field="returnNote"
                header="Note"
                body={(rowData) => rowData.returnNote || "-"}
              />
              <Column header="Status" body={statusBody} />
              <Column
                header="Actions"
                body={actionBody}
                exportable={false}
                style={{ minWidth: "180px" }}
              />
            </DataTable>
          </Card>
        </section>

        <section style={{ marginBottom: "24px" }}>
          <Card
            style={{
              borderRadius: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>Fully Returned Records</h2>
                <p style={{ margin: "6px 0 0 0", color: "#64748b" }}>
                  Showing:{" "}
                  {selectedCurrencyFilter === "ALL"
                    ? "All Currency"
                    : selectedCurrencyFilter}
                </p>
              </div>

              <Button
                label="Export CSV"
                icon="pi pi-download"
                severity="help"
                outlined
                onClick={exportReturnedCSV}
              />
            </div>

            <DataTable
              ref={dtReturned}
              value={filteredCompletedList}
              paginator
              rows={8}
              stripedRows
              responsiveLayout="scroll"
              emptyMessage="No returned records found"
              tableStyle={{ minWidth: "1300px" }}
            >
              <Column field="personName" header="Person Name" sortable />
              <Column header="Type" body={typeBody} />
              <Column field="currency" header="Currency" sortable />
              <Column
                field="paymentMethod"
                header="Original Method"
                body={(rowData) => getPaymentLabel(rowData.paymentMethod)}
              />
              <Column field="date" header="Entry Date" sortable />
              <Column
                header="Total Amount"
                body={(rowData) => amountBody(rowData, "totalAmount")}
                sortable
              />
              <Column
                header="Returned So Far"
                body={(rowData) => amountBody(rowData, "returnedAmount")}
                sortable
              />
              <Column
                header="Left Amount"
                body={(rowData) => amountBody(rowData, "remainingAmount")}
                sortable
              />
              <Column
                field="returnPaymentMethod"
                header="Last Return Method"
                body={(rowData) =>
                  rowData.returnedAmount > 0
                    ? getPaymentLabel(rowData.returnPaymentMethod)
                    : "-"
                }
              />
              <Column
                field="returnDate"
                header="Last Return Date"
                body={(rowData) =>
                  rowData.returnedAmount > 0 ? rowData.returnDate || "-" : "-"
                }
              />
              <Column
                field="returnNote"
                header="Note"
                body={(rowData) => rowData.returnNote || "-"}
              />
              <Column header="Status" body={statusBody} />
              <Column
                header="Actions"
                body={actionBody}
                exportable={false}
                style={{ minWidth: "180px" }}
              />
            </DataTable>
          </Card>
        </section>

        <Dialog
          header="Add Return Amount"
          visible={returnModalOpen}
          style={{ width: "95%", maxWidth: "520px" }}
          onHide={closeReturnModal}
          modal
          breakpoints={{ "960px": "75vw", "640px": "95vw" }}
        >
          {selectedReturnItem && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "14px",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px 0",
                  fontWeight: "700",
                  color: "#0f172a",
                }}
              >
                {selectedReturnItem.personName}
              </p>
              <p style={{ margin: "4px 0", color: "#334155" }}>
                Remaining Amount:{" "}
                <b>
                  {getCurrencySymbol(selectedReturnItem.currency || "INR")}
                  {selectedReturnItem.remainingAmount}
                </b>
              </p>
            </div>
          )}

          <div style={{ display: "grid", gap: "14px" }}>
            <span className="p-float-label">
              <InputNumber
                id="returnAmount"
                value={returnAmount}
                onValueChange={(e) => setReturnAmount(e.value)}
                mode="decimal"
                min={0}
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
              <label htmlFor="returnAmount">Return Amount</label>
            </span>

            <span className="p-float-label">
              <Dropdown
                id="returnPaymentMethod"
                value={returnPaymentMethod}
                options={paymentOptions.map((item) => ({
                  label: item.label,
                  value: item.code,
                }))}
                onChange={(e) => setReturnPaymentMethod(e.value)}
                style={{ width: "100%" }}
              />
              <label htmlFor="returnPaymentMethod">Return Payment Method</label>
            </span>

            <span className="p-float-label">
              <Calendar
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.value)}
                dateFormat="yy-mm-dd"
                showIcon
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
              <label htmlFor="returnDate">Return Date</label>
            </span>

            <span className="p-float-label">
              <InputTextarea
                id="returnNote"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                rows={3}
                autoResize
                style={{ width: "100%" }}
              />
              <label htmlFor="returnNote">Return Note</label>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <Button
              label="Cancel"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={closeReturnModal}
            />
            <Button
              label="Save Return"
              icon="pi pi-check"
              severity="success"
              onClick={handleConfirmReturn}
            />
          </div>
        </Dialog>
      </main>
    </div>
  );
}

export default BorrowPage;