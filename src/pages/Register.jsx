import { useState } from "react";
import API from "../api";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

function Register({ goLogin }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("India");
  const [currency, setCurrency] = useState("INR");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const countryOptions = [
    { country: "India", currency: "INR" },
    { country: "United States", currency: "USD" },
    { country: "Canada", currency: "CAD" },
    { country: "UAE", currency: "AED" },
    { country: "Germany", currency: "EUR" },
    { country: "United Kingdom", currency: "GBP" },
    { country: "Australia", currency: "AUD" },
    { country: "New Zealand", currency: "NZD" },
    { country: "Singapore", currency: "SGD" },
    { country: "Japan", currency: "JPY" }
  ];

  const handleCountryChange = (value) => {
    setCountry(value);
    const selected = countryOptions.find((item) => item.country === value);
    if (selected) {
      setCurrency(selected.currency);
    }
  };

  const handleRegister = async () => {
    if (!name || !username || !password || !country || !currency) {
      setError("Please fill all fields");
      setMessage("");
      return;
    }

    try {
      await API.post("/auth/register", {
        name,
        username,
        password,
        country,
        currency,
      });

      setMessage("Registration successful. Now login.");
      setError("");
      setName("");
      setUsername("");
      setPassword("");
      setCountry("India");
      setCurrency("INR");
    } catch (err) {
      console.error("Register error:", err);
      setError(err?.response?.data?.message || "Registration failed");
      setMessage("");
    }
  };

  return (
    <div
      className="flex align-items-center justify-content-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg,#4facfe,#00f2fe)",
      }}
    >
      <Card
        className="shadow-6"
        style={{
          width: "420px",
          borderRadius: "15px",
          padding: "20px",
        }}
      >
        <div className="text-center mb-4">
          <i
            className="pi pi-user-plus"
            style={{ fontSize: "50px", color: "#4facfe" }}
          ></i>
          <h2>Register</h2>
          <p style={{ color: "#777" }}>Create your account</p>
        </div>

        <div className="field mb-3">
          <label>Name</label>
          <InputText
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
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
          <Password
            className="w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            feedback={false}
            placeholder="Enter password"
          />
        </div>

        <div className="field mb-3">
          <label>Country</label>
          <select
            value={country}
            onChange={(e) => handleCountryChange(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          >
            {countryOptions.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </select>
        </div>

        <div className="field mb-3">
          <label>Currency</label>
          <InputText className="w-full" value={currency} readOnly />
        </div>

        <Button
          label="Register"
          icon="pi pi-user-plus"
          className="w-full p-button-rounded"
          onClick={handleRegister}
        />

        {message && (
          <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
        )}

        {error && (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        )}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have account?{" "}
          <span
            onClick={goLogin}
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "bold" }}
          >
            Login
          </span>
        </p>
      </Card>
    </div>
  );
}

export default Register;