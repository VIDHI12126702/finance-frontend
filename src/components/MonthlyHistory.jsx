import { useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function MonthlyHistory({ transactions = [], transfers = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const symbol = getUserCurrencySymbol();

  const months = [
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  const years = [
    ...new Set(
      [
        ...transactions.map((t) => {
          if (t.year !== undefined && t.year !== null) return t.year;
          if (t.date) return new Date(t.date).getFullYear();
          return null;
        }),
        ...transfers.map((t) => {
          if (t.date) return new Date(t.date).getFullYear();
          return null;
        }),
      ].filter((y) => y !== null)
    ),
  ]
    .sort((a, b) => a - b)
    .map((y) => ({
      label: y.toString(),
      value: y,
    }));

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = t.date ? new Date(t.date) : null;
      const tMonth =
        t.month !== undefined && t.month !== null
          ? t.month
          : tDate
          ? tDate.getMonth()
          : null;
      const tYear =
        t.year !== undefined && t.year !== null
          ? t.year
          : tDate
          ? tDate.getFullYear()
          : null;

      return (
        (selectedMonth === null || tMonth === selectedMonth) &&
        (selectedYear === null || tYear === selectedYear)
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const tDate = t.date ? new Date(t.date) : null;
      const tMonth = tDate ? tDate.getMonth() : null;
      const tYear = tDate ? tDate.getFullYear() : null;

      return (
        (selectedMonth === null || tMonth === selectedMonth) &&
        (selectedYear === null || tYear === selectedYear)
      );
    });
  }, [transfers, selectedMonth, selectedYear]);

  let bankIncome = 0;
  let cashIncome = 0;
  let investmentIncome = 0;

  let bankExpense = 0;
  let cashExpense = 0;
  let investmentExpense = 0;

  filteredTransactions.forEach((t) => {
    const account = (t.account || t.paymentMethod || "BANK").toUpperCase();
    const type = (t.type || "").toUpperCase();
    const amount = Number(t.amount || 0);

    if (type === "INCOME") {
      if (account === "BANK") bankIncome += amount;
      else if (account === "CASH") cashIncome += amount;
      else if (account === "INVESTMENT") investmentIncome += amount;
    } else if (type === "EXPENSE") {
      if (account === "BANK") bankExpense += amount;
      else if (account === "CASH") cashExpense += amount;
      else if (account === "INVESTMENT") investmentExpense += amount;
    }
  });

  let bankBalance = bankIncome - bankExpense;
  let cashBalance = cashIncome - cashExpense;
  let investmentBalance = investmentIncome - investmentExpense;

  filteredTransfers.forEach((tr) => {
    const amount = Number(tr.amount || 0);
    const from = (tr.fromAccount || "").toUpperCase();
    const to = (tr.toAccount || "").toUpperCase();

    if (from === "BANK") bankBalance -= amount;
    else if (from === "CASH") cashBalance -= amount;
    else if (from === "INVESTMENT") investmentBalance -= amount;

    if (to === "BANK") bankBalance += amount;
    else if (to === "CASH") cashBalance += amount;
    else if (to === "INVESTMENT") investmentBalance += amount;
  });

  const totalSaving = bankBalance + cashBalance;
  const overallTotal = bankBalance + cashBalance + investmentBalance;

  const pieData = {
    labels: ["Bank Balance", "Cash Balance", "Investment Balance"],
    datasets: [
      {
        data: [
          Math.abs(bankBalance),
          Math.abs(cashBalance),
          Math.abs(investmentBalance),
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
      },
    ],
  };

  const total =
    Math.abs(bankBalance) +
    Math.abs(cashBalance) +
    Math.abs(investmentBalance);

  const calculatePercent = (value) => {
    if (total === 0) return "0%";
    return ((value / total) * 100).toFixed(1) + "%";
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i];
              return {
                text: `${label} (${calculatePercent(value)})`,
                fillStyle: data.datasets[0].backgroundColor[i],
              };
            });
          },
        },
      },
    },
  };

  const handleShowChart = () => {
    if (selectedMonth === null || selectedYear === null) {
      alert("Please select month and year first");
      return;
    }
    setShowChart(true);
  };

  const selectedMonthLabel =
    selectedMonth !== null
      ? months.find((m) => m.value === selectedMonth)?.label
      : "";

  const tableRows = [
    ...filteredTransactions.map((t) => ({
      ...t,
      rowType: "TRANSACTION",
      displayAccount: t.account || t.paymentMethod || "-",
      displayCategory: t.category || "-",
      displayAmount: `${symbol}${t.amount}`,
      displayDate: t.date || "-",
    })),
    ...filteredTransfers.map((t) => ({
      id: `transfer-${t.id}`,
      type: "TRANSFER",
      displayAccount: `${t.fromAccount} → ${t.toAccount}`,
      displayCategory: "Transfer",
      displayAmount: `${symbol}${t.amount}`,
      displayDate: t.date || "-",
    })),
  ].sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));

  return (
    <div className="analytics-card">
      <h2 className="analytics-title">Monthly History Search</h2>

      <div className="analytics-filter-grid">
        <Dropdown
          value={selectedMonth}
          options={months}
          onChange={(e) => {
            setSelectedMonth(e.value);
            setShowChart(false);
          }}
          placeholder="Select Month"
          className="w-full"
        />

        <Dropdown
          value={selectedYear}
          options={years}
          onChange={(e) => {
            setSelectedYear(e.value);
            setShowChart(false);
          }}
          placeholder="Select Year"
          className="w-full"
        />
      </div>

      <div className="analytics-summary">
        <p>Bank Balance : {symbol}{bankBalance}</p>
        <p>Cash Balance : {symbol}{cashBalance}</p>
        <p>Investment Balance : {symbol}{investmentBalance}</p>
        <p><b>Total Saving : {symbol}{totalSaving}</b></p>
        <p><b>Overall Total : {symbol}{overallTotal}</b></p>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleShowChart}
          style={{
            background: "#4f46e5",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Show Pie Chart
        </button>

        {showChart && (
          <button
            onClick={() => setShowChart(false)}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Close Chart
          </button>
        )}
      </div>

      {showChart && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            maxWidth: "500px",
            margin: "0 auto 24px auto",
          }}
        >
          <h3 style={{ marginBottom: "16px", textAlign: "center" }}>
            {selectedMonthLabel} {selectedYear} Financial Overview
          </h3>

          <Chart type="pie" data={pieData} options={pieOptions} />
        </div>
      )}

      <DataTable value={tableRows} paginator rows={5} responsiveLayout="scroll">
        <Column field="type" header="Type" />
        <Column field="displayAccount" header="Account" />
        <Column field="displayCategory" header="Category" />
        <Column field="displayAmount" header="Amount" />
        <Column field="displayDate" header="Date" />
      </DataTable>
    </div>
  );
}

export default MonthlyHistory;