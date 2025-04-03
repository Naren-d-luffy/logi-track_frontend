import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <header>
      <div className="logo">Warehouse Management</div>
      <div className="nav-links">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
