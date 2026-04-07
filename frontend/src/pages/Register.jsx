import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast"
import "../styles/Auth.css";
import PasswordInput from "../utils/passwordInput";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const [toast, setToast] = useState(null);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {
      await registerUser(form);
      setToast({ message: "Registration successful", type: "success" });

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
        setToast({
            message: err.response?.data?.message || "Registration failed",
            type: "error"
          });
    }
  };

  return (
    
    <div className="auth-page">
    <div className="auth-container">

      <form className="auth-form" onSubmit={handleSubmit}>

        <h2>Create Account</h2>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        
        <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
        />

        <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="read-only">Read Only</option>
        </select>

        <button type="submit">Register</button>

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </form>

      {toast && (
        <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
        />
        )}

    </div>
    </div>
  );
}

export default Register;