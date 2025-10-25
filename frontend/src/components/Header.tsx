import SignInButton from "./SignInButton";

export default function Header() {
  return (
    <header className="landing-header">
      <div className="logo-text">AI Learn</div>
      <nav className="nav-links">
        <a href="#features" className="nav-link">Features</a>
        <a href="#about" className="nav-link">About</a>
        <SignInButton className="login-btn" />
      </nav>
    </header>
  );
}
