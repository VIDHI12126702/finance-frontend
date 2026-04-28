import "./Sidebar.css";

function Sidebar({ goPage, activePage }) {
  const menuItems = [
    { key: "home", icon: "🏠", label: "Home" },
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "monthly", icon: "🗓️", label: "Monthly" },
    { key: "yearly", icon: "📈", label: "Yearly" },
    { key: "history", icon: "📜", label: "History" },
    { key: "bills", icon: "🧾", label: "Bills" },
    { key: "borrow", icon: "💸", label: "Borrow" },
    { key: "transfer", icon: "🏦", label: "Transfer" },
  ];

  return (
    <>
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-logo">💰 Finance App</div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li
              key={item.key}
              className={activePage === item.key ? "active-menu" : ""}
              onClick={() => goPage(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </li>
          ))}
        </ul>

        <button className="logout-btn" onClick={() => goPage("login")}>
          🚪 Logout
        </button>
      </aside>

      <nav className="mobile-bottom-nav">
        <button
          className={activePage === "home" ? "active-mobile" : ""}
          onClick={() => goPage("home")}
        >
          🏠<span>Home</span>
        </button>

        <button
          className={activePage === "dashboard" ? "active-mobile" : ""}
          onClick={() => goPage("dashboard")}
        >
          📊<span>Dash</span>
        </button>

        <button
          className={activePage === "history" ? "active-mobile" : ""}
          onClick={() => goPage("history")}
        >
          📜<span>History</span>
        </button>

        <button
          className={activePage === "borrow" ? "active-mobile" : ""}
          onClick={() => goPage("borrow")}
        >
          💸<span>Borrow</span>
        </button>

        <button
          className={activePage === "transfer" ? "active-mobile" : ""}
          onClick={() => goPage("transfer")}
        >
          🏦<span>Transfer</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;