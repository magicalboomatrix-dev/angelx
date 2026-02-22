"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/admin/check-session");
        if (res.ok) {
          router.replace("/admin/dashboard");
        }
      } catch (err) {
        // no cookie
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "#f8fafc",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "448px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            fontSize: "28px"
          }}>
            🛡️
          </div>
          <h1 style={{
            fontSize: "30px",
            fontWeight: "700",
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.5px"
          }}>AngelX Super</h1>
          <p style={{
            color: "#6b7280",
            marginTop: "8px",
            fontSize: "14px",
            fontWeight: "500"
          }}>Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          padding: "32px"
        }}>
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px"
              }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "16px",
                  pointerEvents: "none"
                }}>✉️</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@angelxsuper.com"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    outline: "none",
                    background: "#ffffff"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "8px"
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "16px",
                  pointerEvents: "none"
                }}>🔒</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                    outline: "none",
                    background: "#ffffff"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2563eb";
                    e.target.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>❌</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#9ca3af" : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                color: "#ffffff",
                fontWeight: "600",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "all 0.2s ease",
                marginBottom: "20px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.95")}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = "1")}
            >
              {loading ? "🔄 Signing in..." : "🔓 Sign In"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "32px",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af"
        }}>
          © 2024 AngelX Super. All rights reserved.
        </div>
      </div>
    </div>
  );
}

