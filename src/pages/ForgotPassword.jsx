import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email) { setError("El email es obligatorio"); return; }
    setLoading(true);
    try {
      await apiRequest("/api/auth/recuperar", {
        method: "POST", body: JSON.stringify({ email }),
      });
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Enviando..." : "Enviar codigo"}
          </button>
        </form>

        <nav className="auth-footer">
          <p><Link to="/">Volver al login</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default ForgotPassword;
