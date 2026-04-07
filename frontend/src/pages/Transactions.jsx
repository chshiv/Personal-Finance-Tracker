// pages/Transactions.jsx
import { useEffect, useState, useMemo } from "react";
import useAuth from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import { getUsers } from "../api/userApi";
import { getCategories } from "../api/categoryApi";
import {
  getTransactions,
  updateTransaction,
  deleteTransaction
} from "../api/transactionApi";
import "../styles/Dashboard.css";

function Transactions() {

  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [editingTxn, setEditingTxn] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "N/A";
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [txnRes, catRes] = await Promise.all([
        getTransactions(),
        getCategories()
      ]);

      setTransactions(txnRes.data);
      setCategories(catRes.data);

      if (user.role === "admin") {
        const userRes = await getUsers();
        setUsers(userRes.data);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (user.role === "admin" && selectedUser !== "all") {
      return transactions.filter(t => t.userId == selectedUser);
    }
    return transactions;
  }, [transactions, selectedUser, user]);

   // Summary
   const total = useMemo(() => {
    let income = 0, expense = 0;

    filteredTransactions.forEach(t => {
      const amount = Number(t.amount) || 0;

      if (t.type === "income") income += amount;
      else expense += amount;
    });

    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleUpdateTransaction = async (data) => {
    const { id, ...payload } = data;

    try {
      const res = await updateTransaction(id, {
        ...payload,
        amount: Number(payload.amount),
        categoryId: payload.categoryId || null
      });

      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...data } : t))
      );

      setEditingTxn(null);

      setToast({
        message: res.data.message || "Transaction updated",
        type: "success"
      });

    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Error",
        type: "error"
      });
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const res = await deleteTransaction(id);

      setTransactions(prev => prev.filter(t => t.id !== id));

      setToast({
        message: res.data.message || "Deleted",
        type: "success"
      });

    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Error",
        type: "error"
      });
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">

      <Navbar />

      {toast?.message && <Toast message={toast.message} type={toast.type} />}

      <div className="dashboard-content">

        {/* Admin Filter */}
        {user.role === "admin" && (
          <div className="filter-box">
            <label>Select User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 🔹 Summary */}
      <div className="cards">
          <div className="card income">Income: ₹{total.income}</div>
          <div className="card expense">Expense: ₹{total.expense}</div>
          <div className="card balance">Balance: ₹{total.balance}</div>
        </div>

       {/* 🔹 Transactions */}
        <div className="section">
          <h3>Transactions</h3>

          <div className="transactions">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5">No transactions</td>
                </tr>
              ) : (
                filteredTransactions.map(t => {
                  const isEditing = editingTxn?.id === t.id;

                  return (
                    <tr key={t.id} className={isEditing ? "editing-row" : ""}>

                      {isEditing && editingTxn ? (
                        <>
                          {/* EDIT MODE */}

                          <td>
                            <select
                              value={editingTxn?.type || ""}
                              onChange={(e) =>
                                setEditingTxn({ ...editingTxn, type: e.target.value })
                              }
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </td>

                          <td>
                            <input
                              value={editingTxn.description}
                              onChange={(e) =>
                                setEditingTxn({
                                  ...editingTxn,
                                  description: e.target.value
                                })
                              }
                            />
                          </td>

                          <td>
                          <select
                            value={editingTxn.categoryId || ""}
                            onChange={(e) =>
                              setEditingTxn({
                                ...editingTxn,
                                categoryId: e.target.value
                              })
                            }
                          >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          </td>

                          <td>
                            <input
                              type="number"
                              value={editingTxn.amount}
                              onChange={(e) =>
                                setEditingTxn({
                                  ...editingTxn,
                                  amount: e.target.value
                                })
                              }
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn-save"
                              onClick={() => handleUpdateTransaction(editingTxn)}
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={() => setEditingTxn(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* NORMAL MODE */}

                          <td>{t.type}</td>
                          <td>{t.description}</td>
                          <td>{getCategoryName(t.categoryId)}</td>
                          <td>₹{t.amount}</td>

                          <td>
                            <button onClick={() => setEditingTxn(t)}>Edit</button>

                            <button onClick={() => handleDeleteTransaction(t.id)}>
                              Delete
                            </button>
                          </td>
                        </>
                      )}

                    </tr>
                  );
                })
              )}
            </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Transactions;