import "./Sidebar.css";

function Sidebar({ goPage, activePage }) {
  const menu = [
    { key: "home", icon: "🏠", label: "Home" },
    { key: "monthly", icon: "🗓️", label: "Monthly Analysis" },
    { key: "yearly", icon: "📈", label: "Yearly Analysis" },
    { key: "history", icon: "📜", label: "Transaction History" },
    { key: "bills", icon: "🧾", label: "Personal Bills" },
    { key: "borrow", icon: "💸", label: "Borrow / Lend" },
    { key: "transfer", icon: "🏦", label: "Transfer" },
  ];

  return (
    <>
      <aside className="sidebar desktop-sidebar">
        <div className="sidebar-logo">💰 Finance App</div>

        <ul className="sidebar-menu">
          {menu.map((item) => (
            <li
              key={item.key}
              className={activePage === item.key ? "active-menu" : ""}
              onClick={() => goPage(item.key)}
            >
              <span>{item.icon}</span>
              {item.label}
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

        <button onClick={() => goPage("login")}>
          🚪<span>Logout</span>
        </button>
      </nav>
    </>
  );
}

export default Sidebar;