// components/Navbar.jsx
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import { FaMoon, FaSun } from "react-icons/fa"; // install react-icons
import "../styles/Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="navbar">
      <h2 className="navbar-title">Finance Tracker</h2>

      <div className="navbar-right">
        <span className="navbar-user">{user?.name} ({user?.role})</span>
        <button onClick={toggleTheme} className="theme-btn">
          {theme === "light" ? <FaMoon /> : <FaSun />}
        </button>
        <button onClick={logout} className="navbar-logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;