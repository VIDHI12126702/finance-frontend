import { useEffect, useState } from "react";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
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

  // 🔥 Install App States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    if (user) {
      setPage("home");
    }
  }, []);

  // 🔥 Listen install event
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("User installed app");
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const goPage = (nextPage) => {
    if (nextPage === "login") {
      localStorage.removeItem("loggedInUser");
      setPage("login");
      return;
    }

    setPage(nextPage);
    window.scrollTo(0, 0);
  };

  let content;

  if (page === "welcome") {
    content = (
      <Welcome
        goLogin={() => setPage("login")}
        goRegister={() => setPage("register")}
      />
    );
  } else if (page === "register") {
    content = <Register goLogin={() => setPage("login")} />;
  } else if (page === "login") {
    content = (
      <Login
        goDashboard={() => setPage("home")}
        goRegister={() => setPage("register")}
      />
    );
  } else if (page === "home") {
    content = <HomePage goPage={goPage} activePage="home" />;
  } else if (page === "monthly") {
    content = <MonthlyPage goPage={goPage} activePage="monthly" />;
  } else if (page === "yearly") {
    content = <YearlyPage goPage={goPage} activePage="yearly" />;
  } else if (page === "history") {
    content = <HistoryPage goPage={goPage} activePage="history" />;
  } else if (page === "bills") {
    content = <BillsPage goPage={goPage} activePage="bills" />;
  } else if (page === "borrow") {
    content = <BorrowPage goPage={goPage} activePage="borrow" />;
  } else if (page === "transfer") {
    content = <TransferPage goPage={goPage} activePage="transfer" />;
  } else {
    content = <HomePage goPage={goPage} activePage="home" />;
  }

  return (
    <>
      {content}

      {/* 🔥 INSTALL BUTTON */}
      {showInstall && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#0d6efd",
            color: "#fff",
            cursor: "pointer",
            zIndex: 9999,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          Install App
        </button>
      )}
    </>
  );
}

export default App;