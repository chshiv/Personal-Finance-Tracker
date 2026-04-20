import { useState, useEffect } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Auth.css";
import PasswordInput from "../utils/passwordInput";
import Toast from "../components/Toast";
import useAuth from "../hooks/useAuth";


function Login() {

  const { login, user } = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user]);

  const [form, setForm] = useState({
    email: "",
    password: ""
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
      const res = await loginUser(form);

      login(
        {
          name: res.data.name,
          role: res.data.role
        },
        res.data.token
      );

      setToast({ message: "Login successful", type: "success" });

    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Invalid credentials",
        type: "error"
      });
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">

      <form className="auth-form" onSubmit={handleSubmit}>

        <h2>Login</h2>

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

        <button type="submit">Login</button>

        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
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

export default Login;