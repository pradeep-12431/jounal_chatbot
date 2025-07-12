import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5050/api", // adjust if needed
});

export default instance;

export const loginUser = (data) => instance.post("/auth/login", data);
export const registerUser = (data) => instance.post("/auth/register", data);
