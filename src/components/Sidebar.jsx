import "./Sidebar.css";

function Sidebar({ goPage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">💰 Finance App</div>

      <ul className="sidebar-menu">
        <li onClick={() => goPage("dashboard")}>📊 Dashboard</li>
        <li onClick={() => goPage("monthly")}>📅 Monthly Analysis</li>
        <li onClick={() => goPage("yearly")}>📈 Yearly Analysis</li>
        <li onClick={() => goPage("history")}>📜 Transaction History</li>
        <li onClick={() => goPage("bills")}>🧾 Personal Bills</li>
        <li onClick={() => goPage("borrow")}>💸 Borrow / Lend</li>
      </ul>

      <button className="logout-btn" onClick={() => goPage("login")}>
        🚪 Logout
      </button>
    </aside>
  );
}

export default Sidebar;