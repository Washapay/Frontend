import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const RESEND_SECONDS = 60;

  useEffect(() => {
    // initialize cooldown from localStorage per-email
    if (!email) return;
    const key = `fp_last_sent_${email}`;
    const ts = Number(localStorage.getItem(key) || 0);
    if (ts > Date.now()) {
      setCooldownLeft(Math.ceil((ts - Date.now()) / 1000));
    } else {
      setCooldownLeft(0);
    }
  }, [email]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const id = setInterval(() => setCooldownLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldownLeft]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) { setError("El email es obligatorio"); return; }
    const key = `fp_last_sent_${email}`;
    const ts = Number(localStorage.getItem(key) || 0);
    if (ts > Date.now()) {
      setCooldownLeft(Math.ceil((ts - Date.now()) / 1000));
      setError(`Ya se envió un correo recientemente. Intenta en ${Math.ceil((ts - Date.now())/1000)}s`);
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/api/auth/recuperar", {
        method: "POST", body: JSON.stringify({ email }),
      });
      // mark last sent and start cooldown
      const until = Date.now() + RESEND_SECONDS * 1000;
      localStorage.setItem(key, String(until));
      setCooldownLeft(RESEND_SECONDS);
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="page auth-page">
      <article className="card">
        <header className="card-header">
          <div className="logo" aria-hidden="true">B</div>
          <h1>Olvide mi contrasena</h1>
          <p>Te enviaremos un codigo a tu correo</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" />
          </div>

          <Alert type="error">{error}</Alert>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || cooldownLeft > 0}>
              {loading && <Spinner />}
              {loading ? "Enviando..." : (cooldownLeft > 0 ? `Reenviar en ${cooldownLeft}s` : "Enviar codigo")}
            </button>
            {cooldownLeft > 0 && (
              <div style={{ fontSize: 13, color: '#666' }}>Evita spam: espera {cooldownLeft}s para reenviar</div>
            )}
          </div>
        </form>

        <nav className="auth-footer">
          <p><Link to="/">Volver al login</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default ForgotPassword;
