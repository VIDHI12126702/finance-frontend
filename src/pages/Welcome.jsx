import { Button } from "primereact/button";

function Welcome({ goLogin, goRegister }) {
  return (
    <div
      className="flex align-items-center justify-content-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
      }}
    >
      <div
        className="card text-center shadow-6"
        style={{
          padding: "50px",
          borderRadius: "15px",
          width: "420px",
          background: "white",
        }}
      >
        <i
          className="pi pi-wallet"
          style={{ fontSize: "60px", color: "#4facfe" }}
        ></i>

        <h1 style={{ marginTop: "20px" }}>Personal Finance Manager</h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          Track your income, expenses and investments in one simple dashboard
        </p>

        <div className="flex flex-column gap-3">
          <Button
            label="Login"
            icon="pi pi-sign-in"
            className="p-button-rounded p-button-lg"
            onClick={goLogin}
          />

          <Button
            label="Register"
            icon="pi pi-user-plus"
            className="p-button-rounded p-button-secondary p-button-lg"
            onClick={goRegister}
          />
        </div>
      </div>
    </div>
  );
}

export default Welcome;