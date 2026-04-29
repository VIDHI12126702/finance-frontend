import { useState } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import API from "../api";
import { getUserCurrencySymbol } from "../utils/currencyUtils";
import {
  parseLocalDate,
  formatDateForApi,
  todayOnly,
  isFutureDate,
} from "../utils/dateUtils";

function TransactionTable({ transactions = [], fetchData, userId }) {
  const [editDialog, setEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbol = getUserCurrencySymbol();

  const typeOptions = [
    { label: "Income", value: "INCOME" },
    { label: "Expense", value: "EXPENSE" },
  ];

  const incomeOptions = [
    { label: "Income", value: "Income" },
    { label: "Returned Money", value: "Returned Money" },
  ];

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

  const getCategoryOptions = () => {
    if (!selectedTransaction) return [];
    return selectedTransaction.type === "INCOME" ? incomeOptions : expenseOptions;
  };

  const amountBody = (rowData) => {
    const sign = rowData.type === "INCOME" ? "+" : "-";

    return `${sign} ${symbol}${Number(rowData.amount || 0).toFixed(2)}`;
  };

  const typeBody = (rowData) => (
    <span
      className={`font-bold ${
        rowData.type === "INCOME" ? "text-green-500" : "text-red-500"
      }`}
    >
      {rowData.type}
    </span>
  );

  const accountBody = (rowData) => rowData.account || rowData.paymentMethod || "-";

  const notesBody = (rowData) => rowData.notes || rowData.note || "-";

  const dateBody = (rowData) => rowData.date || "-";

  const openEdit = (rowData) => {
    setMsg(null);

    setSelectedTransaction({
      ...rowData,
      type: String(rowData.type || "EXPENSE").toUpperCase(),
      date: rowData.date ? parseLocalDate(rowData.date) : new Date(),
      notes: rowData.notes || rowData.note || "",
      bill: rowData.bill || null,
      account: rowData.account || rowData.paymentMethod || "BANK",
      category:
        rowData.category || (rowData.type === "INCOME" ? "Income" : "Rent"),
      amount: Number(rowData.amount || 0),
    });

    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedTransaction) return;

    if (isFutureDate(selectedTransaction.date)) {
      setMsg({
        type: "error",
        text: "Future date is not allowed.",
      });
      return;
    }

    if (!selectedTransaction.amount || Number(selectedTransaction.amount) <= 0) {
      setMsg({
        type: "error",
        text: "Please enter valid amount.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);

      const payload = {
        id: selectedTransaction.id,
        type: selectedTransaction.type,
        category: selectedTransaction.category,
        account: selectedTransaction.account,
        amount: Number(Number(selectedTransaction.amount || 0).toFixed(2)),
        notes: selectedTransaction.notes || "",
        bill: selectedTransaction.bill || null,
        date: formatDateForApi(selectedTransaction.date),
        user: { id: userId },
      };

      await API.put(`/transactions/${selectedTransaction.id}`, payload);

      setEditDialog(false);
      fetchData?.();
    } catch (error) {
      console.error("Update error:", error);

      setMsg({
        type: "error",
        text: error?.response?.data?.message || "Failed to update transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this transaction?");

    if (!ok) return;

    try {
      setMsg(null);

      await API.delete(`/transactions/${id}`);

      fetchData?.();
    } catch (error) {
      console.error("Delete error:", error);

      setMsg({
        type: "error",
        text: "Failed to delete transaction.",
      });
    }
  };

  const actionBody = (rowData) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        outlined
        onClick={() => openEdit(rowData)}
      />

      <Button
        icon="pi pi-trash"
        rounded
        severity="danger"
        outlined
        onClick={() => handleDelete(rowData.id)}
      />
    </div>
  );

  const handleBillChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      setSelectedTransaction({
        ...selectedTransaction,
        bill: reader.result,
      });
    };
  };

  return (
    <>
      <Card title="Transaction History" className="shadow-2 border-round-2xl">
        {msg && (
          <Message severity={msg.type} text={msg.text} className="w-full mb-3" />
        )}

        <DataTable
          value={transactions}
          paginator
          rows={5}
          responsiveLayout="scroll"
          emptyMessage="No transactions found."
        >
          <Column field="type" header="Type" body={typeBody} />
          <Column field="account" header="Account" body={accountBody} />
          <Column field="category" header="Category" />
          <Column field="amount" header="Amount" body={amountBody} />
          <Column field="date" header="Date" body={dateBody} />
          <Column field="notes" header="Notes" body={notesBody} />
          <Column header="Actions" body={actionBody} />
        </DataTable>
      </Card>

      <Dialog
        header="Edit Transaction"
        visible={editDialog}
        style={{ width: "95%", maxWidth: "720px" }}
        modal
        onHide={() => setEditDialog(false)}
      >
        {selectedTransaction && (
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Type</label>
              <Dropdown
                value={selectedTransaction.type}
                options={typeOptions}
                onChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    type: e.value,
                    category: e.value === "INCOME" ? "Income" : "Rent",
                  })
                }
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Account</label>
              <Dropdown
                value={selectedTransaction.account}
                options={accountOptions}
                onChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    account: e.value,
                  })
                }
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Category</label>
              <Dropdown
                value={selectedTransaction.category}
                options={getCategoryOptions()}
                onChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    category: e.value,
                  })
                }
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Amount</label>
              <InputNumber
                value={selectedTransaction.amount}
                onValueChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    amount: e.value,
                  })
                }
                mode="decimal"
                min={0}
                minFractionDigits={0}
                maxFractionDigits={2}
                inputMode="decimal"
                className="w-full"
              />
            </div>

            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Date</label>
              <Calendar
                value={selectedTransaction.date}
                onChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    date: e.value,
                  })
                }
                dateFormat="dd/mm/yy"
                showIcon
                maxDate={todayOnly()}
                className="w-full"
              />
            </div>

            <div className="col-12">
              <label className="block mb-2 font-medium">Notes</label>
              <InputTextarea
                value={selectedTransaction.notes}
                onChange={(e) =>
                  setSelectedTransaction({
                    ...selectedTransaction,
                    notes: e.target.value,
                  })
                }
                rows={4}
                autoResize
                className="w-full"
              />
            </div>

            {selectedTransaction.type === "EXPENSE" &&
              selectedTransaction.category === "Personal Use" && (
                <div className="col-12">
                  <label className="block mb-2 font-medium">Bill Image</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBillChange}
                    className="w-full p-inputtext"
                  />

                  {selectedTransaction.bill && (
                    <div className="mt-3">
                      <img
                        src={selectedTransaction.bill}
                        alt="Bill"
                        style={{
                          width: "100%",
                          maxHeight: "240px",
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
                        onClick={() =>
                          setSelectedTransaction({
                            ...selectedTransaction,
                            bill: null,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              )}

            <div className="col-12">
              <Button
                label={loading ? "Updating..." : "Update"}
                icon="pi pi-check"
                onClick={handleUpdate}
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
        )}
      </Dialog>
    </>
  );
}

export default TransactionTable;