import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, signOutUser, onAuthChanged } from "../firebase";
import type { User } from "firebase/auth";

type Props = {
  className?: string;
};

export default function SignInButton({ className }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  if (user) {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          type="button"
          aria-label="User menu"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((s) => !s);
          }}
          style={{
            padding: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            border: "none",
            outline: "none",
            background: "transparent",
            boxShadow: "none",
            cursor: "pointer",
          }}
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoURL} alt={user.displayName ?? "avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontWeight: 700 }}>
              {user.displayName ? user.displayName[0].toUpperCase() : (user.email ?? "U")[0].toUpperCase()}
            </div>
          )}
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              marginTop: 8,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              minWidth: 160,
              zIndex: 50,
              padding: 8,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                // Placeholder: open preferences UI. Replace with real route/modal.
                // eslint-disable-next-line no-alert
                alert("Open preferences (not implemented)");
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#0f172a",
                borderRadius: 6,
              }}
            >
              Change preferences
            </button>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  await signOutUser();
                  setMenuOpen(false);
                    // after sign-out, return to landing page
                    navigate("/");
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error("Sign out failed:", err);
                  // eslint-disable-next-line no-alert
                  alert("Sign out failed. Check console for details.");
                }
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
                borderRadius: 6,
                marginTop: 4,
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        style={{ border: "none", outline: "none", boxShadow: "none" }}
          onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setSigningIn(true);
          try {
            const res = await signInWithGoogle();
            // after successful sign-in, route the user to /learn
            navigate("/learn");
            return res;
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Sign-in failed:", err);
            // eslint-disable-next-line no-alert
            alert("Sign-in failed. Check console for details.");
          } finally {
            setSigningIn(false);
          }
        }}
      >
        Sign in
      </button>

      {signingIn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ padding: 24, background: "white", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Signing in…</div>
            <div style={{ width: 36, height: 36, borderRadius: 18, border: "4px solid #cbd5e1", borderTopColor: "#4a90e2", animation: "spin 1s linear infinite" }} />
          </div>
          <style>{"@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }"}</style>
        </div>
      )}
    </>
  );
}
