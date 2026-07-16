import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SwiftLogo from "../../assets/logo/IndefLogo.png";
import BgImage from "../../assets/images/it-hepdesk-front.jpg";
import BgImage1 from "../../assets/images/it-hep-desk-bg.jpg";
import { API_BASE_URL, AUTH_TOKEN } from "../../config/env";

/* ── Tokens ─────────────────────────────────────── */
const ACCENT = "#5789A0"; // red CTA like in reference
const ACCENT_DARK = "#5789A0";
const TEXT_MAIN = "#111111";
const TEXT_SUB = "#9aa3b0";
const BORDER = "#e4e8ed";
const ERROR = "#ef4444";
const INPUT_FOCUS = "rgba(30, 45, 122, 0.12)";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
    return e;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ILeap/AuthenticateHDUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_TOKEN,
        },
        body: JSON.stringify({ emp_No: username, password: password }),
      });
      const data = await res.json();
      console.log("data", data);
      if (data.status !== "Success") {
        throw new Error(data.message || "Invalid credentials");
      }
      sessionStorage.setItem("user", JSON.stringify(data.data));
      navigate("/helpdesk", { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Full-viewport outer shell ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
          backgroundImage: `url(${BgImage1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Dark overlay on outer bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(6,14,22,0.62)",
            backdropFilter: "blur(1px)",
          }}
        />

        {/* ── Floating card ───────────────────────────────────────── */}
        <div
          className="login-card"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "min(940px, 92vw)",
            height: "min(600px, 90vh)",
            borderRadius: 26,
            overflow: "hidden",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* ══ LEFT — Dark image panel ══════════════════════════════ */}
          <div
            className="login-image-panel"
            style={{
              flex: "0 0 48%",
              position: "relative",
              backgroundImage: `url(${BgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "0",
            }}
          >
            {/* Dark scrim */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 100%)",
              }}
            />

            {/* Top nav bar */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 24px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              ></div>
            </div>

            {/* Bottom tagline + attribution */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                padding: "0 24px 26px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {/* SWIFT */}
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.3,
                    textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                  }}
                >
                  Helpdesk
                  <br />
                  Integrated IT & HR support portal
                </h2>
              </div>
            </div>
          </div>

          {/* ══ RIGHT — White form panel ══════════════════════════════ */}
          <div
            style={{
              flex: 1,
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              padding: "28px 40px 28px",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            {/* Top bar: logo + language */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              <img
                src={SwiftLogo}
                alt="Swift"
                style={{ height: 80, objectFit: "contain" }}
              />
            </div>

            {/* Heading */}
            <h1
              style={{
                margin: "0 0 4px",
                fontSize: 30,
                fontWeight: 800,
                color: TEXT_MAIN,
                letterSpacing: "-0.6px",
                lineHeight: 1.15,
                textAlign: "center",
              }}
            >
              Welcome 👋
            </h1>
            <p
              style={{
                margin: "0 0 60px",
                fontSize: 13,
                color: TEXT_SUB,
                textAlign: "center",
              }}
            >
              Log in to your Helpdesk account
            </p>

            {/* API error */}
            {apiError && (
              <div
                style={{
                  marginBottom: 14,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#fef2f2",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: ERROR,
                  fontSize: 12,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {apiError}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 11 }}
              noValidate
            >
              {/* Username */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username)
                      setErrors((p) => ({ ...p, username: undefined }));
                  }}
                  placeholder="Username"
                  autoComplete="username"
                  style={{
                    height: 48,
                    padding: "0 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${errors.username ? ERROR : BORDER}`,
                    background: errors.username ? "#fef2f2" : "#f8f9fb",
                    fontSize: 13.5,
                    color: TEXT_MAIN,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    width: "100%",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = ACCENT;
                    e.target.style.boxShadow = `0 0 0 3px ${INPUT_FOCUS}`;
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.username
                      ? ERROR
                      : BORDER;
                    e.target.style.boxShadow = "none";
                    e.target.style.background = errors.username
                      ? "#fef2f2"
                      : "#f8f9fb";
                  }}
                />
                {errors.username && (
                  <span style={{ fontSize: 11, color: ERROR, paddingLeft: 4 }}>
                    {errors.username}
                  </span>
                )}
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password)
                        setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="Password"
                    autoComplete="current-password"
                    style={{
                      height: 48,
                      padding: "0 44px 0 16px",
                      borderRadius: 10,
                      border: `1.5px solid ${errors.password ? ERROR : BORDER}`,
                      background: errors.password ? "#fef2f2" : "#f8f9fb",
                      fontSize: 13.5,
                      color: TEXT_MAIN,
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      width: "100%",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = ACCENT;
                      e.target.style.boxShadow = `0 0 0 3px ${INPUT_FOCUS}`;
                      e.target.style.background = "#fff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.password
                        ? ERROR
                        : BORDER;
                      e.target.style.boxShadow = "none";
                      e.target.style.background = errors.password
                        ? "#fef2f2"
                        : "#f8f9fb";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      color: TEXT_SUB,
                      display: "flex",
                      alignItems: "center",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = ACCENT)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = TEXT_SUB)
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: 11, color: ERROR, paddingLeft: 4 }}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "2px 0",
                }}
              >
                <div style={{ flex: 1, height: 1, background: BORDER }} />
                <span
                  style={{ fontSize: 12, color: TEXT_SUB, fontWeight: 500 }}
                ></span>
                <div style={{ flex: 1, height: 1, background: BORDER }} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 50,
                  width: "100%",
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "#5789A0" : ACCENT,
                  color: "#fff",
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.02em",
                  boxShadow: loading
                    ? "none"
                    : "2px 4px 2px rgba(47, 97, 224, 0.38)",
                  transition:
                    "opacity 0.15s, transform 0.12s, background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = ACCENT_DARK;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = loading
                    ? "#e8928d"
                    : ACCENT;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <>
                    <svg
                      style={{ animation: "loginSpin 0.8s linear infinite" }}
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Logging in…
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            {/* Social icons row */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <p style={{ fontSize: 11, color: "#9c9c9c", margin: 0 }}>
                © {new Date().getFullYear()} Indef Manufacturing Limited
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loginSpin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        @media (max-width: 680px) {
          .login-image-panel { display: none !important; }
        }
      `}</style>
    </>
  );
}

/* ── Tiny social icon button ─────────────────────────────── */
function SocialIcon({ children, color }) {
  return (
    <button
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: "1.5px solid #e8ecf0",
        background: "#fff",
        color: "#7a8a9a",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s, border-color 0.15s, box-shadow 0.15s",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = color;
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${color}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#7a8a9a";
        e.currentTarget.style.borderColor = "#e8ecf0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}
