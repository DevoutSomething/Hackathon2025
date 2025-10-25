import { Link, useLocation } from "react-router-dom";
import SignInButton from "./SignInButton";

export default function Header() {
  const location = useLocation();
  
  return (
    <header className="landing-header">
      <div className="logo-text">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          AI Learn
        </Link>
      </div>
      <nav className="nav-links">
        <Link 
          to="/learn" 
          className={`nav-link ${location.pathname === '/learn' ? 'active' : ''}`}
        >
          Learn
        </Link>
        <Link 
          to="/video" 
          className={`nav-link ${location.pathname === '/video' ? 'active' : ''}`}
        >
          Video
        </Link>
        <a href="#features" className="nav-link">Features</a>
        <a href="#about" className="nav-link">About</a>
        <SignInButton className="login-btn" />
      </nav>
    </header>
  );
}
