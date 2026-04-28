import { useEffect, useState } from "react";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import MonthlyPage from "./pages/MonthlyPage";
import YearlyPage from "./pages/YearlyPage";
import HistoryPage from "./pages/HistoryPage";
import BillsPage from "./pages/BillsPage";
import BorrowPage from "./pages/BorrowPage";
import TransferPage from "./pages/TransferPage";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
  const [page, setPage] = useState("welcome");

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) setPage("home");
  }, []);

  const goPage = (nextPage) => {
    if (nextPage === "login") {
      localStorage.removeItem("loggedInUser");
      setPage("login");
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (page === "welcome") {
    return (
      <Welcome
        goLogin={() => setPage("login")}
        goRegister={() => setPage("register")}
      />
    );
  }

  if (page === "register") return <Register goLogin={() => setPage("login")} />;

  if (page === "login") {
    return (
      <Login
        goDashboard={() => setPage("home")}
        goRegister={() => setPage("register")}
      />
    );
  }

  if (page === "home") return <HomePage goPage={goPage} activePage={page} />;
  if (page === "dashboard") return <Dashboard goPage={goPage} activePage={page} />;
  if (page === "monthly") return <MonthlyPage goPage={goPage} activePage={page} />;
  if (page === "yearly") return <YearlyPage goPage={goPage} activePage={page} />;
  if (page === "history") return <HistoryPage goPage={goPage} activePage={page} />;
  if (page === "bills") return <BillsPage goPage={goPage} activePage={page} />;
  if (page === "borrow") return <BorrowPage goPage={goPage} activePage={page} />;
  if (page === "transfer") return <TransferPage goPage={goPage} activePage={page} />;

  return <HomePage goPage={goPage} activePage="home" />;
}

export default App;