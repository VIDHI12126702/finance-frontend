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

function TransactionTable({ transactions = [], fetchData, userId }) {
  const [editDialog, setEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const symbol = getUserCurrencySymbol();

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

  const formatDateForApi = (value) => {
    if (!value) return null;
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const amountBody = (rowData) => {
    const sign = rowData.type === "INCOME" ? "+" : "-";
    return `${sign} ${symbol}${Number(rowData.amount || 0).toFixed(2)}`;
  };

  const typeBody = (rowData) => {
    return (
      <span
        className={`font-bold ${
          rowData.type === "INCOME" ? "text-green-500" : "text-red-500"
        }`}
      >
        {rowData.type}
      </span>
    );
  };

  const accountBody = (rowData) =>
    rowData.account || rowData.paymentMethod || "-";

  const notesBody = (rowData) =>
    rowData.notes || rowData.note || "-";

  const dateBody = (rowData) => rowData.date || "-";

  const openEdit = (rowData) => {
    setMsg(null);
    setSelectedTransaction({
      ...rowData,
      date: rowData.date ? new Date(rowData.date) : new Date(),
      notes: rowData.notes || rowData.note || "",
      account: rowData.account || rowData.paymentMethod || "BANK",
      category:
        rowData.category ||
        (rowData.type === "INCOME" ? "Income" : "Rent"),
    });
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedTransaction) return;

    try {
      setLoading(true);
      setMsg(null);

      const payload = {
        type: selectedTransaction.type,
        category: selectedTransaction.category,
        paymentMethod: selectedTransaction.account, // FIXED
        amount: Number(selectedTransaction.amount || 0),
        note: selectedTransaction.notes || "", // FIXED
        date: formatDateForApi(selectedTransaction.date),
        user: { id: userId },
      };

      await API.put(`/transactions/${selectedTransaction.id}`, payload);
      setEditDialog(false);

      if (fetchData) {
        fetchData();
      }
    } catch (error) {
      console.error("Update error:", error);
      setMsg({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Failed to update transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setMsg(null);
      await API.delete(`/transactions/${id}`);
      if (fetchData) {
        fetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMsg({ type: "error", text: "Failed to delete transaction." });
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

  return (
    <Card title="Transaction History" className="shadow-2 border-round-2xl">
      {msg && <Message severity={msg.type} text={msg.text} className="w-full mb-3" />}

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

      <Dialog
        header="Edit Transaction"
        visible={editDialog}
        style={{ width: "36rem" }}
        onHide={() => setEditDialog(false)}
      >
        {selectedTransaction && (
          <div className="grid">
            <div className="col-12 md:col-6">
              <label className="block mb-2 font-medium">Type</label>
              <Dropdown
                value={selectedTransaction.type}
                options={[
                  { label: "INCOME", value: "INCOME" },
                  { label: "EXPENSE", value: "EXPENSE" },
                ]}
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
                rows={3}
                className="w-full"
                autoResize
              />
            </div>

            <div className="col-12">
              <Button
                label={loading ? "Updating..." : "Update"}
                icon="pi pi-check"
                onClick={handleUpdate}
                loading={loading}
                className="w-full"
              />
            </div>
          </div>
        )}
      </Dialog>
    </Card>
  );
}

export default TransactionTable;