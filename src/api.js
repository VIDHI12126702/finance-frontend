import axios from "axios";

const API = axios.create({
  baseURL: "https://finance-backend-12pz.onrender.com/api",
});

export default API;