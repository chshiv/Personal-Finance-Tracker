import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import { getAnalytics } from "../api/analyticApi";
import useAuth from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { getUsers } from "../api/userApi";

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

import "../styles/Analytics.css";
import "../styles/Dashboard.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function InnerLegend() {
  return (
    <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ width: 12, height: 12, backgroundColor: "#00C49F" }} />
        <span>Income</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ width: 12, height: 12, backgroundColor: "#FF4D4F" }} />
        <span>Expense</span>
      </div>
    </div>
  );
}

function Analytics() {

  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("all");
  const [users, setUsers] = useState([]);

  // ✅ define first
  const fetchAnalytics = async (userId = "all") => {
    try {
      const res = await getAnalytics(userId);
      setData(res.data);
    } catch (err) {
      console.error("ERROR:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("USER FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
  
    setLoading(true);
    fetchAnalytics(selectedUser);
  
  }, [user, selectedUser]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers(); // ✅ only once
    }
  }, [user]);

  const formatNumber = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
    return value;
  };

  const categoryData = useMemo(() => data?.categoryWise || [], [data]);
  const monthlyData = useMemo(() => data?.monthlyTrend || [], [data]);
  const incomeExpenseData = useMemo(() => data?.incomeVsExpense || [], [data]);

  // AFTER hooks → safe returns
  if (authLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="analytics-container">
        <Navbar />
        <div className="loading">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <Navbar />

      <div className="analytics-content">

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

        {/* SUMMARY */}
        <div className="cards">
          <div className="card income">
            <h4>Total Income</h4>
            <p>₹{data.totalIncome}</p>
          </div>

          <div className="card expense">
            <h4>Total Expense</h4>
            <p>₹{data.totalExpense}</p>
          </div>

          <div className="card balance">
            <h4>Balance</h4>
            <p>₹{data.balance}</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="charts-row">

          {/* PIE */}
          <div className="chart">
            <h3>Category Distribution</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ value }) => formatNumber(value)}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

          </div>

          {/* BAR */}
          <div className="chart">
            <h3>Income vs Expense</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis width={80} tickFormatter={formatNumber} />
                <Tooltip formatter={(value) => formatNumber(value)} />

                <Legend content={<CustomLegend />} />

                <Bar dataKey="amount">
                  {incomeExpenseData.map((entry) => (
                    <Cell
                      key={`${entry.type}-${entry.amount}`}
                      fill={entry.type === "Income" ? "#00C49F" : "#FF4D4F"}
                    />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* LINE */}
        <div className="chart full">
          <h3>Monthly Trends</h3>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#00C49F" />
              <Line type="monotone" dataKey="expense" stroke="#FF8042" />
            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>
    </div>
  );
}

export default Analytics