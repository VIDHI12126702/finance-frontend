import { useState } from "react";
import API from "../api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

function Register({ goLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    country: "India",
    currency: "INR",
  });

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
    { country: "Japan", currency: "JPY" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const selected = countryOptions.find(
      (item) => item.country === selectedCountry
    );

    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      currency: selected ? selected.currency : "INR",
    }));
  };

  const handleRegister = async () => {
    setError("");
    setMessage("");

    const payload = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password.trim(),
      country: formData.country,
      currency: formData.currency,
    };

    if (
      !payload.name ||
      !payload.username ||
      !payload.password ||
      !payload.country ||
      !payload.currency
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      await API.post("/auth/register", payload);

      setMessage("Registration successful. Now login.");
      setFormData({
        name: "",
        username: "",
        password: "",
        country: "India",
        currency: "INR",
      });
    } catch (err) {
      console.error("Register error:", err?.response?.data || err);
      setError(err?.response?.data?.message || "Registration failed");
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
            name="name"
            className="w-full"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
          />
        </div>

        <div className="field mb-3">
          <label>Username</label>
          <InputText
            name="username"
            className="w-full"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
          />
        </div>

        <div className="field mb-3">
          <label>Password</label>
          <input
            name="password"
            type="password"
            className="w-full p-inputtext"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
            }}
          />
        </div>

        <div className="field mb-3">
          <label>Country</label>
          <select
            value={formData.country}
            onChange={handleCountryChange}
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
          <InputText className="w-full" value={formData.currency} readOnly />
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