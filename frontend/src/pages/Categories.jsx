// pages/Categories.jsx
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import ManageCategories from "../components/ManageCategories";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import { getCategories } from "../api/categoryApi";
import "../styles/Dashboard.css";

const Categories = () => {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      {toast?.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="dashboard-content">

        {user.role === "admin" && (
          <div className="section">
            <ManageCategories
              categories={categories}
              setCategories={setCategories}
              setToast={setToast}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Categories;