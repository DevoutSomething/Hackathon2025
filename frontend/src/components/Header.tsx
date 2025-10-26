import { Link, useLocation } from "react-router-dom";
import SignInButton from "./SignInButton";
import "../../styles/Header.css";

export default function Header() {
  const location = useLocation();

  return (
    <header className="landing-header">
      <div className="logo-text">
        <Link to="/" className="logo-link">
          Learnr
        </Link>
      </div>

      <nav className="nav-links">
        <Link
          to="/learn"
          className={`nav-link ${location.pathname === "/learn" ? "active" : ""}`}
        >
          Learn
        </Link>

        <Link
          to="/whiteboard"
          className={`nav-link ${location.pathname === "/whiteboard" ? "active" : ""}`}
        >
          Whiteboard
        </Link>

        <SignInButton className="login-btn" />
      </nav>
    </header>
  );
}
