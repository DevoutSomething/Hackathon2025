import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle, signOutUser, onAuthChanged } from "../firebase";
import type { User } from "firebase/auth";
import UserSettingsForm from "./UserSettingsForm";
import { useUserSettings } from "../contexts/UserSettingsContext";

type Props = {
  className?: string;
};

export default function SignInButton({ className }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const navigate = useNavigate();
  const { settings } = useUserSettings();

  useEffect(() => {
    const unsub = onAuthChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  // If user is signed in, show avatar + dropdown
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

        {/* Preferences modal will open directly when requested from the menu */}

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
                // open the preferences modal first, then close the menu to avoid render-order issues
                setPrefsOpen(true);
                setMenuOpen(false);
                try { window.dispatchEvent(new CustomEvent('modalBlur', { detail: { open: true } })); } catch(e){}
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
              Change Learning Preferences
            </button>

            {/* Preferences modal */}
            {prefsOpen && (
              <div
                role="dialog"
                aria-modal="true"
                onClick={() => {
                  setPrefsOpen(false);
                  try { window.dispatchEvent(new CustomEvent('modalBlur', { detail: { open: false } })); } catch(e){}
                }}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.30)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 520,
                    maxWidth: "92%",
                    background: "#fff",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "0 12px 40px rgba(2,6,23,0.15)",
                    transition: 'transform 180ms ease, opacity 180ms ease',
                    transform: 'scale(1)'
                  }}
                >
                  <h3 style={{ margin: 0, marginBottom: 12 }}>Change learning preferences</h3>
                  <UserSettingsForm />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefsOpen(false);
                        try { window.dispatchEvent(new CustomEvent('modalBlur', { detail: { open: false } })); } catch(e){}
                      }}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#e5e7eb", border: "none" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
                          // prefer PUT to a preferences endpoint, fallback to POST /users
                          if (!user?.email) {
                            // eslint-disable-next-line no-alert
                            alert("Missing user email. Cannot save preferences.");
                            return;
                          }
                          const body = {
                            email: user.email,
                            learningPreference: settings.learningStyle,
                            educationLevel: settings.educationLevel,
                          };
                          // try PUT first
                          let res = await fetch(`${apiUrl}/users/preferences`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(body),
                          });
                          if (res.status === 404 || !res.ok) {
                            // fallback to POST /users which performs upsert
                            res = await fetch(`${apiUrl}/users`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(body),
                            });
                          }
                          if (!res.ok) {
                            // eslint-disable-next-line no-alert
                            alert("Failed to save preferences. See console.");
                            // eslint-disable-next-line no-console
                            console.error("Save prefs failed", await res.text());
                            return;
                          }
                          // parse returned user (if any) so we can immediately update UI
                          let returned = null;
                          try {
                            returned = await res.json();
                          } catch (err) {
                            // ignore parse errors
                          }
                          // close modal
                          setPrefsOpen(false);
                          try { window.dispatchEvent(new CustomEvent('modalBlur', { detail: { open: false } })); } catch(e){}
                          // notify other parts of the app (Learn page) to re-fetch preferences and show toast
                          try {
                            window.dispatchEvent(new CustomEvent('preferencesUpdated', { detail: { email: user.email, user: returned?.user || returned } }));
                          } catch (e) {
                            // ignore if dispatch fails
                          }
                        } catch (err) {
                          // eslint-disable-next-line no-console
                          console.error("Error saving preferences:", err);
                          // eslint-disable-next-line no-alert
                          alert("Error saving preferences. Check console.");
                        }
                      }}
                      style={{ padding: "8px 14px", borderRadius: 8, background: "#2563eb", color: "white", border: "none" }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

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
            // after successful sign-in, upsert the user into our backend and route based on backend response
            try {
              const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
              const user = res?.user;
              if (user) {
                const r = await fetch(`${apiUrl}/users`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uid: user?.uid, email: user?.email, displayName: user?.displayName, photoURL: user?.photoURL })
                });
                // If backend returns JSON with isNew and user.lastVisitedRoute, use that to decide where to go
                try {
                  const payload = await r.json();
                  const dest = payload?.user?.lastVisitedRoute || (payload?.isNew ? '/learn' : '/learn');
                  navigate(dest);
                } catch (parseErr) {
                  // Fallback: navigate to learn if response was not JSON
                  // eslint-disable-next-line no-console
                  console.warn('Could not parse /users response, routing to /learn', parseErr);
                  navigate('/learn');
                }
              } else {
                // No user object from Firebase - go to learn as a safe default
                navigate('/learn');
              }
            } catch (e) {
              // eslint-disable-next-line no-console
              console.warn('Failed to upsert user to backend:', e);
              // On failure, route to learn as a safe default
              navigate('/learn');
            }
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