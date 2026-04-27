import "./Sidebar.css";

function Sidebar({ goPage }) {
  return (
    <>
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-logo">💰 Finance App</div>

        <ul className="sidebar-menu">
          <li onClick={() => goPage("dashboard")}>📊 Dashboard</li>
          <li onClick={() => goPage("monthly")}>📅 Monthly</li>
          <li onClick={() => goPage("yearly")}>📈 Yearly</li>
          <li onClick={() => goPage("history")}>📜 History</li>
          <li onClick={() => goPage("bills")}>🧾 Bills</li>
          <li onClick={() => goPage("borrow")}>💸 Borrow</li>
          <li onClick={() => goPage("transfer")}>🏦 Transfer</li>
        </ul>

        <button className="logout-btn" onClick={() => goPage("login")}>
          🚪 Logout
        </button>
      </aside>

      <nav className="mobile-bottom-nav">
        <button onClick={() => goPage("dashboard")}>📊<span>Home</span></button>
        <button onClick={() => goPage("history")}>📜<span>History</span></button>
        <button onClick={() => goPage("borrow")}>💸<span>Borrow</span></button>
        <button onClick={() => goPage("transfer")}>🏦<span>Transfer</span></button>
        <button onClick={() => goPage("login")}>🚪<span>Logout</span></button>
      </nav>
    </>
  );
}

export default Sidebar;