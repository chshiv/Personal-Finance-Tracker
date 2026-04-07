import api from "./axios";

export const getTransactions = () => {
  return api.get(`/transactions`);
};

export const createTransaction = (data) => {
  return api.post("/transactions", data);
};

export const updateTransaction = (id, data) => {
  return api.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`);
};