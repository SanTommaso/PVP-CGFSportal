import { useState } from "react";

export default function LoginPage({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Errore durante il login");
        return;
      }
      onSuccess(data);
    } catch {
      setError("Impossibile contattare il server. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.brandMark}>PVP</span>
          <div>
            <strong style={styles.brandName}>PVP / CGFS Portal</strong>
            <div style={styles.brandSub}>Accedi per continuare</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Il tuo username"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <button type="submit" disabled={loading || !username || !password} style={styles.submitBtn}>
            {loading ? "Accesso in corso…" : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #dce2ea",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(17,24,39,0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "32px",
  },
  brandMark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    background: "#0a0a0b",
    color: "#fff",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "13px",
    letterSpacing: "0.04em",
    flexShrink: 0,
  },
  brandName: {
    display: "block",
    fontSize: "16px",
    fontWeight: 700,
    color: "#111318",
    lineHeight: 1.3,
  },
  brandSub: {
    fontSize: "13px",
    color: "#667085",
    marginTop: "2px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "10px 14px",
    border: "1px solid #dce2ea",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#111318",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
  },
  errorMsg: {
    margin: 0,
    padding: "10px 14px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    color: "#be123c",
    fontSize: "13px",
  },
  submitBtn: {
    marginTop: "4px",
    padding: "11px 20px",
    background: "#0a0a0b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
};
