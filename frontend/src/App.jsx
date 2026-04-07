import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";


const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Users = lazy(() => import("./pages/Users"));
const Categories = lazy(() => import("./pages/Categories"));
const Analytics = lazy(() => import("./pages/Analytics"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* admin + user */}
          <Route path="/transactions" element={
            <ProtectedRoute roles={["admin", "user", "read-only"]}>
              <Transactions />
            </ProtectedRoute>
          } />

          {/* admin only */}
          <Route path="/users" element={
            <ProtectedRoute roles={["admin"]}>
              <Users />
            </ProtectedRoute>
          } />

          {/* admin only */}
          <Route path="/categories" element={
            <ProtectedRoute roles={["admin"]}>
              <Categories />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={<Analytics />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;