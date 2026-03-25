import { useEffect, useState } from "react";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MonthlyPage from "./pages/MonthlyPage";
import YearlyPage from "./pages/YearlyPage";
import HistoryPage from "./pages/HistoryPage";
import BillsPage from "./pages/BillsPage";
import BorrowPage from "./pages/BorrowPage";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

function App() {
  const [page, setPage] = useState("welcome");

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setPage("dashboard");
    }
  }, []);

  const goPage = (nextPage) => {
    if (nextPage === "login") {
      localStorage.removeItem("loggedInUser");
    }
    setPage(nextPage);
  };

  if (page === "welcome") {
    return (
      <Welcome
        goLogin={() => setPage("login")}
        goRegister={() => setPage("register")}
      />
    );
  }

  if (page === "register") {
    return <Register goLogin={() => setPage("login")} />;
  }

  if (page === "login") {
    return (
      <Login
        goDashboard={() => setPage("dashboard")}
        goRegister={() => setPage("register")}
      />
    );
  }

  if (page === "monthly") {
    return <MonthlyPage goPage={goPage} />;
  }

  if (page === "yearly") {
    return <YearlyPage goPage={goPage} />;
  }

  if (page === "history") {
    return <HistoryPage goPage={goPage} />;
  }

  if (page === "bills") {
    return <BillsPage goPage={goPage} />;
  }

  if (page === "borrow") {
    return <BorrowPage goPage={goPage} />;
  }

  return <Dashboard goPage={goPage} />;
}

export default App;