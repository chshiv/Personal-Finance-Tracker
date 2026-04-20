// pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import TransactionForm from "../components/TransactionForm";
import Toast from "../components/Toast";

import {
  getCategories
} from "../api/categoryApi";

import { getUsers } from "../api/userApi";

import {
  createTransaction
} from "../api/transactionApi";

import "../styles/Dashboard.css";

function Dashboard() {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch ONLY required data
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const catRes = await getCategories();
      setCategories(catRes.data);

      if (user.role === "admin") {
        const userRes = await getUsers();
        setUsers(userRes.data);
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add Transaction (still works)
  const handleAddTransaction = async (data) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        userId: data.userId || user.id
      };

      const res = await createTransaction(payload);

      setToast({
        message: res.data.message || "Transaction added",
        type: "success"
      });

    } catch (err) {
      console.error(err);
    
      setToast({
        message: err.response?.data?.message || "Something went wrong",
        type: "error"
      });
    }
  };

  if (!user || loading) return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <div className="loading-screen">Loading...</div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">

      <Navbar />

      {/* TOAST */}
      {toast?.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="dashboard-content">

        {/* 🔹 Admin Filter */}
        <div className="filter-box">

        {/* Available to ALL users */}
        <button 
          className="feature-btn" 
          onClick={() => navigate("/transactions")}
        >
          View Transactions
        </button>

        {/* Only admin */}
        {user.role === "admin" && (
          <button 
            className="feature-btn" 
            onClick={() => navigate("/categories")}
          >
            View Categories
          </button>
        )}

        {/* Available to all roles */}
        <button 
          className="feature-btn" 
          onClick={() => navigate("/analytics")}
        >
          View Analytics
        </button>

      </div>

        {/* 🔹 Transaction Form (UNCHANGED) */}
        {user.role !== "read-only" && (
          <div className="section">
            <h3>Add Transaction</h3>

            <div className="form-wrapper">
              <TransactionForm
                onSubmit={handleAddTransaction}
                users={users}
                categories={categories}
                isAdmin={user.role === "admin"}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;