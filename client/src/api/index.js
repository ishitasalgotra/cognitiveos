import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cos_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const notesApi = {
  list:        (params)   => api.get("/notes", { params }),
  get:         (id)       => api.get(`/notes/${id}`),
  create:      (data)     => api.post("/notes", data),
  update:      (id, data) => api.put(`/notes/${id}`, data),
  delete:      (id)       => api.delete(`/notes/${id}`),
  updateLinks: (id, data) => api.patch(`/notes/${id}/links`, data),
};

export const graphApi = {
  get: () => api.get("/graph"),
};

export const debuggerApi = {
  analyze: (input) => api.post("/debugger", { input }),
  history: ()      => api.get("/debugger/history"),
};

export const simulateApi = {
  solutions: ()     => api.get("/simulate/solutions"),
  score:     (data) => api.post("/simulate/score", data),
};

export const searchApi = {
  text:     (q, limit) => api.get("/search", { params: { q, limit } }),
  semantic: (query, topK) => api.post("/search/semantic", { query, top_k: topK }),
};

export default api;