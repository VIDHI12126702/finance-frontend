import { useMemo, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import "./Analytics.css";
import { getUserCurrencySymbol } from "../utils/currencyUtils";

function MonthlyHistory({ transactions }) {
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

  const years = [...new Set(transactions.map((t) => t.year))]
    .filter((y) => y !== undefined && y !== null)
    .sort((a, b) => a - b)
    .map((y) => ({
      label: y.toString(),
      value: y,
    }));

  const filtered = useMemo(() => {
    return transactions.filter(
      (t) =>
        (selectedMonth === null || t.month === selectedMonth) &&
        (selectedYear === null || t.year === selectedYear)
    );
  }, [transactions, selectedMonth, selectedYear]);

  let income = 0;
  let expense = 0;
  let investment = 0;

  filtered.forEach((t) => {
    if (t.type === "Income") {
      income += Number(t.amount);
    } else if (t.type === "Investment") {
      investment += Number(t.amount);
    } else {
      expense += Number(t.amount);
    }
  });

  const saving = income - expense - investment;

  const pieData = {
    labels: ["Income", "Expense", "Investment", "Balance"],
    datasets: [
      {
        data: [income, expense, investment, saving],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b", "#4f46e5"],
      },
    ],
  };

  const total = income + expense + investment + Math.abs(saving);

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
                text: `${label} (${calculatePercent(Math.abs(value))})`,
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
        <p>Total Income : {symbol}{income}</p>
        <p>Total Expense : {symbol}{expense}</p>
        <p>Total Investment : {symbol}{investment}</p>
        <p>
          <b>Total Balance : {symbol}{saving}</b>
        </p>
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

      <DataTable value={filtered} paginator rows={5} responsiveLayout="scroll">
        <Column field="type" header="Type" />
        <Column field="category" header="Category" />
        <Column
          header="Amount"
          body={(rowData) => `${symbol}${rowData.amount}`}
        />
        <Column field="date" header="Date" />
      </DataTable>
    </div>
  );
}

export default MonthlyHistory;