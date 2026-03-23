import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({ baseURL: "/api" });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cos_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const useAuth = create((set) => ({
  user:        null,
  token:       localStorage.getItem("cos_token") || null,
  authLoading: true,
  authReady:   false,

  init: async () => {
    const token = localStorage.getItem("cos_token");
    if (!token) { set({ authLoading: false, authReady: true }); return; }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, authLoading: false, authReady: true });
    } catch {
      localStorage.removeItem("cos_token");
      set({ user: null, token: null, authLoading: false, authReady: true });
    }
  },

  register: async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("cos_token", data.token);
    set({ user: data.user, token: data.token });
    toast.success(`Welcome, ${data.user.name}!`);
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("cos_token", data.token);
    set({ user: data.user, token: data.token });
    toast.success(`Welcome back, ${data.user.name}!`);
    return data;
  },

  logout: () => {
    localStorage.removeItem("cos_token");
    set({ user: null, token: null });
    toast.success("Logged out");
  },
}));

export default useAuth;