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
  const [note, setNote] = useState("");

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

  const money = (value) => Number(Number(value || 0).toFixed(2));

  const formatDateForApi = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(
      2,
      "0"
    )}-${`${d.getDate()}`.padStart(2, "0")}`;
  };

  const normalizeBorrowItem = (item) => {
    const totalAmount = money(item.totalAmount ?? item.amount ?? 0);
    const returnedAmount = money(item.returnedAmount ?? 0);
    const remainingAmount = money(
      item.remainingAmount ?? Math.max(totalAmount - returnedAmount, 0)
    );

    let status = item.status;

    if (!status) {
      if (remainingAmount <= 0) status = "RETURNED";
      else if (returnedAmount > 0) status = "PARTIAL";
      else status = "PENDING";
    }

    return {
      ...item,
      totalAmount,
      amount: totalAmount,
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
      showError("Failed to load records");
    }
  };

  const getCurrencySymbol = (code) => {
    const found = currencyOptions.find((item) => item.code === code);
    return found ? found.symbol : `${code} `;
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
    const cleanAmount = money(amount);

    if (!personName.trim() || !paymentMethod || !date) {
      showError("Please fill all fields");
      return;
    }

    if (cleanAmount <= 0) {
      showError("Amount must be greater than 0");
      return;
    }

    try {
      await API.post("/borrow", {
        personName: personName.trim(),
        amount: cleanAmount,
        returnedAmount: 0,
        remainingAmount: cleanAmount,
        status: "PENDING",
        type,
        currency,
        paymentMethod,
        date: formatDateForApi(date),
        note: note.trim(),
        user: { id: userId },
      });

      setPersonName("");
      setAmount(null);
      setType("GIVE");
      setCurrency("INR");
      setPaymentMethod("CASH");
      setDate(new Date());
      setNote("");

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

    const cleanReturnAmount = money(returnAmount);

    if (cleanReturnAmount <= 0) {
      showError("Please enter valid return amount");
      return;
    }

    if (cleanReturnAmount > money(selectedReturnItem.remainingAmount)) {
      showError("Return amount cannot be greater than remaining amount");
      return;
    }

    try {
      await API.put(`/borrow/return/${selectedReturnItem.id}`, {
        returnAmount: cleanReturnAmount.toString(),
        returnPaymentMethod,
        returnDate: formatDateForApi(returnDate),
        note: returnNote.trim(),
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
        entry.totalGiven += money(item.totalAmount);
        entry.totalReturnReceived += money(item.returnedAmount);
        entry.leftToReceive += money(item.remainingAmount);
      } else {
        entry.totalTaken += money(item.totalAmount);
        entry.totalPaidBack += money(item.returnedAmount);
        entry.leftToPay += money(item.remainingAmount);
      }
    });

    return Object.values(summaryMap).sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
  }, [list]);

  const currencyFilterOptions = [
    { label: "All Currency", value: "ALL" },
    ...currencyOptions.map((c) => ({
      label: `${c.symbol} ${c.code}`,
      value: c.code,
    })),
  ];

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
        {money(rowData[field]).toFixed(2)}
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

  const paymentBody = (rowData) => getPaymentLabel(rowData.paymentMethod);

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

  return (
    <div className="page-layout">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Sidebar goPage={goPage} />

      <main className="page-main">
        <section className="page-header">
          <h1>💸 Borrow / Lend</h1>
          <p>Manage money you gave, took and returned</p>
        </section>

        <div className="grid mb-4">
          {currencySummary.length === 0 ? (
            <div className="col-12">
              <Card className="shadow-2 border-round-2xl">
                <p className="m-0 text-600">No borrow/lend summary found.</p>
              </Card>
            </div>
          ) : (
            currencySummary.map((item) => (
              <div className="col-12 md:col-6 xl:col-4" key={item.currency}>
                <Card className="shadow-2 border-round-2xl">
                  <h3 className="mt-0">
                    {getCurrencySymbol(item.currency)} {item.currency}
                  </h3>

                  <p>
                    Total Given:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.totalGiven).toFixed(2)}
                    </b>
                  </p>

                  <p>
                    Return Received:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.totalReturnReceived).toFixed(2)}
                    </b>
                  </p>

                  <p>
                    Left To Receive:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.leftToReceive).toFixed(2)}
                    </b>
                  </p>

                  <hr />

                  <p>
                    Total Taken:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.totalTaken).toFixed(2)}
                    </b>
                  </p>

                  <p>
                    Paid Back:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.totalPaidBack).toFixed(2)}
                    </b>
                  </p>

                  <p>
                    Left To Pay:{" "}
                    <b>
                      {getCurrencySymbol(item.currency)}
                      {money(item.leftToPay).toFixed(2)}
                    </b>
                  </p>
                </Card>
              </div>
            ))
          )}
        </div>

        <section className="page-box">
          <h2 className="mt-0">Add Borrow / Lend Record</h2>

          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Person Name</label>
              <InputText
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter person name"
                className="w-full"
              />
            </div>

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
              <label className="block mb-2 font-medium">Type</label>
              <Dropdown
                value={type}
                options={typeOptions}
                onChange={(e) => setType(e.value)}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Currency</label>
              <Dropdown
                value={currency}
                options={currencyOptions}
                optionLabel="label"
                optionValue="code"
                onChange={(e) => setCurrency(e.value)}
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Payment Method</label>
              <Dropdown
                value={paymentMethod}
                options={paymentOptions}
                optionLabel="label"
                optionValue="code"
                onChange={(e) => setPaymentMethod(e.value)}
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
              <label className="block mb-2 font-medium">Note</label>
              <InputTextarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                autoResize
                placeholder="Optional note"
                className="w-full"
              />
            </div>

            <div className="col-12">
              <Button
                label="Save Record"
                icon="pi pi-save"
                onClick={handleAdd}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="page-box">
          <h2 className="mt-0">Search / Filter</h2>

          <div className="grid">
            <div className="col-12 md:col-6">
              <InputText
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search person name"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <Dropdown
                value={selectedCurrencyFilter}
                options={currencyFilterOptions}
                onChange={(e) => setSelectedCurrencyFilter(e.value)}
                className="w-full"
              />
            </div>
          </div>
        </section>

        <section className="page-box">
          <div className="flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h2 className="m-0">Pending / Partial Records</h2>

            <Button
              label="Export CSV"
              icon="pi pi-download"
              outlined
              onClick={() => dtPending.current?.exportCSV()}
            />
          </div>

          <DataTable
            ref={dtPending}
            value={filteredPendingList}
            paginator
            rows={5}
            responsiveLayout="scroll"
            emptyMessage="No pending records found."
          >
            <Column field="personName" header="Person" />
            <Column header="Type" body={typeBody} />
            <Column
              field="totalAmount"
              header="Total"
              body={(row) => amountBody(row, "totalAmount")}
            />
            <Column
              field="returnedAmount"
              header="Returned"
              body={(row) => amountBody(row, "returnedAmount")}
            />
            <Column
              field="remainingAmount"
              header="Remaining"
              body={(row) => amountBody(row, "remainingAmount")}
            />
            <Column field="paymentMethod" header="Payment" body={paymentBody} />
            <Column field="date" header="Date" />
            <Column header="Status" body={statusBody} />
            <Column header="Action" body={actionBody} />
          </DataTable>
        </section>

        <section className="page-box">
          <div className="flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h2 className="m-0">Returned Records</h2>

            <Button
              label="Export CSV"
              icon="pi pi-download"
              outlined
              onClick={() => dtReturned.current?.exportCSV()}
            />
          </div>

          <DataTable
            ref={dtReturned}
            value={filteredCompletedList}
            paginator
            rows={5}
            responsiveLayout="scroll"
            emptyMessage="No returned records found."
          >
            <Column field="personName" header="Person" />
            <Column header="Type" body={typeBody} />
            <Column
              field="totalAmount"
              header="Total"
              body={(row) => amountBody(row, "totalAmount")}
            />
            <Column
              field="returnedAmount"
              header="Returned"
              body={(row) => amountBody(row, "returnedAmount")}
            />
            <Column field="paymentMethod" header="Payment" body={paymentBody} />
            <Column field="date" header="Date" />
            <Column header="Status" body={statusBody} />
            <Column header="Action" body={actionBody} />
          </DataTable>
        </section>

        <Dialog
          header="Add Return"
          visible={returnModalOpen}
          style={{ width: "95%", maxWidth: "520px" }}
          modal
          onHide={closeReturnModal}
        >
          {selectedReturnItem && (
            <div className="grid">
              <div className="col-12">
                <p>
                  Person: <b>{selectedReturnItem.personName}</b>
                </p>
                <p>
                  Remaining:{" "}
                  <b>
                    {getCurrencySymbol(selectedReturnItem.currency)}
                    {money(selectedReturnItem.remainingAmount).toFixed(2)}
                  </b>
                </p>
              </div>

              <div className="col-12">
                <label className="block mb-2 font-medium">Return Amount</label>
                <InputNumber
                  value={returnAmount}
                  onValueChange={(e) => setReturnAmount(e.value)}
                  mode="decimal"
                  min={0}
                  minFractionDigits={0}
                  maxFractionDigits={2}
                  inputMode="decimal"
                  placeholder="Example: 200.50"
                  className="w-full"
                />
              </div>

              <div className="col-12">
                <label className="block mb-2 font-medium">
                  Return Payment Method
                </label>
                <Dropdown
                  value={returnPaymentMethod}
                  options={paymentOptions}
                  optionLabel="label"
                  optionValue="code"
                  onChange={(e) => setReturnPaymentMethod(e.value)}
                  className="w-full"
                />
              </div>

              <div className="col-12">
                <label className="block mb-2 font-medium">Return Date</label>
                <Calendar
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-full"
                />
              </div>

              <div className="col-12">
                <label className="block mb-2 font-medium">Note</label>
                <InputTextarea
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  rows={3}
                  autoResize
                  className="w-full"
                />
              </div>

              <div className="col-12 flex gap-2">
                <Button
                  label="Cancel"
                  severity="secondary"
                  outlined
                  onClick={closeReturnModal}
                  className="w-full"
                />

                <Button
                  label="Save Return"
                  icon="pi pi-check"
                  onClick={handleConfirmReturn}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </Dialog>
      </main>
    </div>
  );
}

export default BorrowPage;