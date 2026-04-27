import { useState } from "react";
import API from "../api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

function Login({ goDashboard, goRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const payload = {
      username: username.trim(),
      password: password.trim(),
    };

    if (!payload.username || !payload.password) {
      setError("Please enter username and password");
      return;
    }

    try {
      const res = await API.post("/auth/login", payload);
      localStorage.setItem("loggedInUser", JSON.stringify(res.data));
      goDashboard();
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || "Invalid username or password");
    }
  };

  return (
    <div
      className="flex align-items-center justify-content-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
      }}
    >
      <Card
        className="shadow-6"
        style={{
          width: "380px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <div className="text-center mb-4">
          <i
            className="pi pi-user"
            style={{ fontSize: "50px", color: "#667eea" }}
          ></i>

          <h2>Login</h2>
          <p style={{ color: "#777" }}>Access your Finance Dashboard</p>
        </div>

        <div className="field mb-3">
          <label>Username</label>
          <InputText
            className="w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div className="field mb-3">
          <label>Password</label>
          <input
            type="password"
            className="w-full p-inputtext"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          />
        </div>

        <Button
          label="Login"
          icon="pi pi-sign-in"
          className="w-full p-button-rounded"
          onClick={handleLogin}
        />

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        )}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          New user?{" "}
          <span
            onClick={goRegister}
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "bold" }}
          >
            Register
          </span>
        </p>
      </Card>
    </div>
  );
}

export default Login;