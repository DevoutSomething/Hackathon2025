import { Link } from "react-router-dom";
import "../../styles/Landing.css";
// SignInButton removed from Landing; header renders the auth control globally.

export default function Landing() {
  return (
    <div className="landing-container">
      <div className="glass-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="content-wrapper">
        <main className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Learn Smarter,
              <br />
              <span className="gradient-text">Not Harder</span>
            </h1>
            <p className="hero-description">
              Experience the future of education with AI-powered interactive learning.
              Visualize concepts, take quizzes, and master any subject with personalized guidance.
            </p>
            <div className="cta-buttons">
              <Link to="/learn" className="primary-btn">
                Get Started
              </Link>
              <button className="secondary-btn">
                Watch Demo
              </button>
            </div>
          </div>

          <div className="features-container">
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>Interactive Learning</h3>
              <p>Engage with AI-powered explanations</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3>Smart Quizzes</h3>
              <p>Test your knowledge instantly</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3>Visual Concepts</h3>
              <p>See ideas come to life</p>
            </div>
          </div>
        </main>

        <footer className="landing-footer">
          <p>© 2025 AI Learn</p>
        </footer>
      </div>
    </div>
  );
}
