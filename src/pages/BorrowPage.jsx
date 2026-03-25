import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../api";
import "./PageLayout.css";

function BorrowPage({ goPage }) {
const [list, setList] = useState([]);
const [personName, setPersonName] = useState("");
const [amount, setAmount] = useState("");
const [type, setType] = useState("GIVE");
const [currency, setCurrency] = useState("INR");
const [paymentMethod, setPaymentMethod] = useState("CASH");
const [viewCurrency, setViewCurrency] = useState("ALL");

const [returnModalOpen, setReturnModalOpen] = useState(false);
const [selectedReturnItem, setSelectedReturnItem] = useState(null);
const [returnPaymentMethod, setReturnPaymentMethod] = useState("CASH");

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

const user = JSON.parse(localStorage.getItem("loggedInUser"));
const userId = user?.id;

useEffect(() => {
if (userId) {
fetchData();
}
}, [userId]);

const fetchData = async () => {
try {
const res = await API.get(`/borrow/user/${userId}`);
setList(res.data || []);
} catch (err) {
console.error("Error fetching borrow/lend data:", err);
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

const handleAdd = async () => {
if (!personName.trim() || !amount || !paymentMethod) {
alert("Please fill all fields");
return;
}

if (Number(amount) <= 0) {
alert("Amount must be greater than 0");
return;
}

try {
await API.post("/borrow", {
personName: personName.trim(),
amount: Number(amount),
type,
currency,
paymentMethod,
date: new Date().toISOString().split("T")[0],
returned: false,
user: { id: userId },
});

setPersonName("");
setAmount("");
setType("GIVE");
setCurrency("INR");
setPaymentMethod("CASH");
fetchData();
} catch (err) {
console.error("Error saving borrow/lend data:", err);
alert("Failed to save data");
}
};

const openReturnModal = (item) => {
setSelectedReturnItem(item);
setReturnPaymentMethod("CASH");
setReturnModalOpen(true);
};

const closeReturnModal = () => {
setSelectedReturnItem(null);
setReturnPaymentMethod("CASH");
setReturnModalOpen(false);
};

const handleConfirmReturn = async () => {
if (!selectedReturnItem) return;

try {
await API.put(`/borrow/return/${selectedReturnItem.id}`, {
returnPaymentMethod,
});
closeReturnModal();
fetchData();
} catch (err) {
console.error("Error marking returned:", err);
alert("Failed to update status");
}
};

const handleDelete = async (id) => {
try {
await API.delete(`/borrow/${id}`);
fetchData();
} catch (err) {
console.error("Error deleting entry:", err);
alert("Failed to delete data");
}
};

const pendingList = useMemo(() => {
return list.filter((item) => !item.returned);
}, [list]);

const completedList = useMemo(() => {
return list.filter((item) => item.returned);
}, [list]);

const filteredPendingList = useMemo(() => {
if (viewCurrency === "ALL") return pendingList;
return pendingList.filter((item) => (item.currency || "INR") === viewCurrency);
}, [pendingList, viewCurrency]);

const filteredCompletedList = useMemo(() => {
if (viewCurrency === "ALL") return completedList;
return completedList.filter((item) => (item.currency || "INR") === viewCurrency);
}, [completedList, viewCurrency]);

const currencySummary = useMemo(() => {
const summaryMap = {};

list.forEach((item) => {
const curr = (item.currency || "INR").toUpperCase();

if (!summaryMap[curr]) {
summaryMap[curr] = {
currency: curr,
totalRecords: 0,
pendingRecords: 0,
returnedRecords: 0,
totalGiven: 0,
totalTaken: 0,
pendingGiven: 0,
pendingTaken: 0,
youWillReceive: 0,
youNeedToPay: 0,
};
}

summaryMap[curr].totalRecords += 1;

if (item.returned) {
summaryMap[curr].returnedRecords += 1;
} else {
summaryMap[curr].pendingRecords += 1;
}

if (item.type === "GIVE") {
summaryMap[curr].totalGiven += Number(item.amount || 0);
if (!item.returned) {
summaryMap[curr].pendingGiven += Number(item.amount || 0);
}
} else {
summaryMap[curr].totalTaken += Number(item.amount || 0);
if (!item.returned) {
summaryMap[curr].pendingTaken += Number(item.amount || 0);
}
}
});

Object.keys(summaryMap).forEach((curr) => {
const item = summaryMap[curr];

if (item.pendingGiven > item.pendingTaken) {
item.youWillReceive = item.pendingGiven - item.pendingTaken;
item.youNeedToPay = 0;
} else if (item.pendingTaken > item.pendingGiven) {
item.youNeedToPay = item.pendingTaken - item.pendingGiven;
item.youWillReceive = 0;
} else {
item.youWillReceive = 0;
item.youNeedToPay = 0;
}
});

return Object.values(summaryMap).sort((a, b) =>
a.currency.localeCompare(b.currency)
);
}, [list]);

const cardStyle = {
background: "#ffffff",
borderRadius: "18px",
padding: "20px",
boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
border: "1px solid #e5e7eb",
};

const inputStyle = {
width: "100%",
padding: "12px 14px",
borderRadius: "10px",
border: "1px solid #cbd5e1",
outline: "none",
fontSize: "15px",
};

const primaryButtonStyle = {
background: "linear-gradient(135deg, #4f46e5, #2563eb)",
color: "#fff",
border: "none",
padding: "12px 18px",
borderRadius: "10px",
fontWeight: "600",
cursor: "pointer",
};

const renderStatusBadge = (returned) => {
return (
<span
style={{
background: returned ? "#dcfce7" : "#fef3c7",
color: returned ? "#166534" : "#92400e",
padding: "6px 12px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "700",
}}
>
{returned ? "Returned" : "Pending"}
</span>
);
};

const renderTypeBadge = (itemType) => {
const isGive = itemType === "GIVE";

return (
<span
style={{
background: isGive ? "#fee2e2" : "#dbeafe",
color: isGive ? "#b91c1c" : "#1d4ed8",
padding: "6px 12px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: "700",
}}
>
{isGive ? "I Gave" : "I Took"}
</span>
);
};

const renderBorrowRow = (item, isReturnedSection = false) => {
return (
<div
key={item.id}
style={{
border: "1px solid #e5e7eb",
borderRadius: "14px",
padding: "16px",
background: "#ffffff",
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "16px",
flexWrap: "wrap",
}}
>
<div style={{ minWidth: "220px", flex: 1 }}>
<p style={{ margin: "0 0 6px 0", fontSize: "28px" }}>
{item.type === "GIVE" ? "💸" : "💰"}
</p>

<p style={{ margin: "0 0 4px 0", fontWeight: "700", fontSize: "24px" }}>
{item.personName}
</p>

<p style={{ margin: "0 0 4px 0", color: "#334155" }}>
Type: {item.type === "GIVE" ? "I Gave" : "I Took"}
</p>

<p style={{ margin: "0 0 4px 0", color: "#334155" }}>
Currency: {item.currency || "INR"}
</p>

<p style={{ margin: "0 0 4px 0", color: "#334155" }}>
Original Method: {getPaymentLabel(item.paymentMethod || "CASH")}
</p>

{item.returned && (
<>
<p style={{ margin: "0 0 4px 0", color: "#334155" }}>
Returned Via: {getPaymentLabel(item.returnPaymentMethod || "CASH")}
</p>
<p style={{ margin: "0 0 4px 0", color: "#334155" }}>
Return Date: {item.returnDate || "-"}
</p>
</>
)}

<p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
Entry Date: {item.date}
</p>
</div>

<div
style={{
display: "flex",
alignItems: "center",
gap: "14px",
flexWrap: "wrap",
justifyContent: "flex-end",
}}
>
<p
style={{
margin: 0,
fontWeight: "700",
fontSize: "30px",
minWidth: "120px",
textAlign: "right",
}}
>
{getCurrencySymbol(item.currency || "INR")}
{item.amount}
</p>

<div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
{renderTypeBadge(item.type)}
{renderStatusBadge(item.returned)}
</div>

{!isReturnedSection && (
<button
onClick={() => openReturnModal(item)}
style={{
background: "#f59e0b",
color: "#fff",
border: "none",
padding: "10px 14px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "600",
}}
>
Return
</button>
)}

<button
onClick={() => handleDelete(item.id)}
style={{
background: "#ef4444",
color: "#fff",
border: "none",
padding: "10px 14px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "600",
}}
>
Delete
</button>
</div>
</div>
);
};

return (
<div className="page-layout">
<Sidebar goPage={goPage} />

<main className="page-main">
<section
className="page-header"
style={{
background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
color: "#fff",
borderRadius: "20px",
padding: "24px",
marginBottom: "24px",
}}
>
<h1 style={{ margin: 0 }}>💸 Borrow / Lend Manager</h1>
<p style={{ marginTop: "8px", marginBottom: 0 }}>
Original payment and return payment can be different
</p>
</section>

<section style={{ ...cardStyle, marginBottom: "24px" }}>
<h2 style={{ marginTop: 0, marginBottom: "18px" }}>Add New Entry</h2>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "14px",
}}
>
<input
type="text"
placeholder="Enter person name"
value={personName}
onChange={(e) => setPersonName(e.target.value)}
style={inputStyle}
/>

<input
type="number"
placeholder="Enter amount"
value={amount}
onChange={(e) => setAmount(e.target.value)}
style={inputStyle}
/>

<select
value={type}
onChange={(e) => setType(e.target.value)}
style={inputStyle}
>
<option value="GIVE">I Gave</option>
<option value="TAKE">I Took</option>
</select>

<select
value={currency}
onChange={(e) => setCurrency(e.target.value)}
style={inputStyle}
>
{currencyOptions.map((item) => (
<option key={item.code} value={item.code}>
{item.code} ({item.label})
</option>
))}
</select>

<select
value={paymentMethod}
onChange={(e) => setPaymentMethod(e.target.value)}
style={inputStyle}
>
{paymentOptions.map((item) => (
<option key={item.code} value={item.code}>
{item.label}
</option>
))}
</select>
</div>

<div style={{ marginTop: "18px" }}>
<button onClick={handleAdd} style={primaryButtonStyle}>
Add Record
</button>
</div>
</section>

<section style={{ marginBottom: "24px" }}>
<h2 style={{ marginBottom: "16px" }}>Currency Summary</h2>

{currencySummary.length === 0 ? (
<div style={cardStyle}>
<p style={{ margin: 0 }}>No summary available</p>
</div>
) : (
<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
gap: "18px",
}}
>
{currencySummary.map((item) => (
<div
key={item.currency}
style={{
...cardStyle,
background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
}}
>
<h3 style={{ marginTop: 0, marginBottom: "10px" }}>
{item.currency} Summary
</h3>

<p style={{ margin: "8px 0", color: "#475569" }}>
{getCurrencyLabel(item.currency)}
</p>

<p style={{ margin: "8px 0", fontWeight: "600" }}>
Total Records: {item.totalRecords}
</p>

<p style={{ margin: "8px 0", fontWeight: "600" }}>
Pending Records: {item.pendingRecords}
</p>

<p style={{ margin: "8px 0", fontWeight: "600" }}>
Returned Records: {item.returnedRecords}
</p>

<p style={{ margin: "8px 0", fontWeight: "600" }}>
Total Given: {getCurrencySymbol(item.currency)}
{item.totalGiven}
</p>

<p style={{ margin: "8px 0", fontWeight: "600" }}>
Total Taken: {getCurrencySymbol(item.currency)}
{item.totalTaken}
</p>

<p style={{ margin: "8px 0", fontWeight: "700", color: "#166534" }}>
You Will Receive: {getCurrencySymbol(item.currency)}
{item.youWillReceive}
</p>

<p style={{ margin: "8px 0", fontWeight: "700", color: "#b91c1c" }}>
You Need To Pay: {getCurrencySymbol(item.currency)}
{item.youNeedToPay}
</p>
</div>
))}
</div>
)}
</section>

<section style={{ ...cardStyle, marginBottom: "24px" }}>
<h2 style={{ marginTop: 0, marginBottom: "18px" }}>Borrow History Filter</h2>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
gap: "14px",
}}
>
<select
value={viewCurrency}
onChange={(e) => setViewCurrency(e.target.value)}
style={inputStyle}
>
<option value="ALL">All Currency History</option>
{currencyOptions.map((item) => (
<option key={item.code} value={item.code}>
{item.code} History
</option>
))}
</select>
</div>
</section>

<div
style={{
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
gap: "20px",
marginBottom: "24px",
}}
>
<section style={cardStyle}>
<h2 style={{ marginTop: 0, marginBottom: "18px" }}>
Pending Records {viewCurrency !== "ALL" ? `(${viewCurrency})` : ""}
</h2>

{filteredPendingList.length === 0 ? (
<p style={{ marginBottom: 0 }}>No pending records found</p>
) : (
<div style={{ display: "grid", gap: "14px" }}>
{filteredPendingList.map((item) => renderBorrowRow(item, false))}
</div>
)}
</section>

<section style={cardStyle}>
<h2 style={{ marginTop: 0, marginBottom: "18px" }}>
Returned Records {viewCurrency !== "ALL" ? `(${viewCurrency})` : ""}
</h2>

{filteredCompletedList.length === 0 ? (
<p style={{ marginBottom: 0 }}>No returned records found</p>
) : (
<div style={{ display: "grid", gap: "14px" }}>
{filteredCompletedList.map((item) => renderBorrowRow(item, true))}
</div>
)}
</section>
</div>

{returnModalOpen && (
<div
style={{
position: "fixed",
inset: 0,
background: "rgba(0,0,0,0.5)",
display: "flex",
alignItems: "center",
justifyContent: "center",
zIndex: 999,
padding: "16px",
}}
onClick={closeReturnModal}
>
<div
style={{
background: "#fff",
borderRadius: "16px",
padding: "24px",
width: "100%",
maxWidth: "420px",
}}
onClick={(e) => e.stopPropagation()}
>
<h2 style={{ marginTop: 0 }}>Return Payment Method</h2>

<p style={{ color: "#475569" }}>
Choose how you returned this money.
</p>

<select
value={returnPaymentMethod}
onChange={(e) => setReturnPaymentMethod(e.target.value)}
style={inputStyle}
>
{paymentOptions.map((item) => (
<option key={item.code} value={item.code}>
{item.label}
</option>
))}
</select>

<div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
<button
onClick={closeReturnModal}
style={{
flex: 1,
background: "#cbd5e1",
color: "#0f172a",
border: "none",
padding: "12px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "600",
}}
>
Cancel
</button>

<button
onClick={handleConfirmReturn}
style={{
flex: 1,
background: "#16a34a",
color: "#fff",
border: "none",
padding: "12px",
borderRadius: "10px",
cursor: "pointer",
fontWeight: "600",
}}
>
Confirm Return
</button>
</div>
</div>
</div>
)}
</main>
</div>
);
}

export default BorrowPage;