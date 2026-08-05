import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function VerifyCode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !codigo) { setError("Email y codigo son obligatorios."); return; }
    setLoading(true);
    try {
      await apiRequest("/api/auth/verify-code", {
        method: "POST", body: JSON.stringify({ email, codigo }),
      });
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleReenviar() {
    setError("");
    if (!email) { setError("Ingresa tu email primero."); return; }
    try {
      await apiRequest("/api/auth/reenviar-codigo", {
        method: "POST", body: JSON.stringify({ email }),
      });
      setError("Codigo reenviado. Revisa tu correo o la consola del backend.");
    } catch (err) { setError(err.message); }
  }

  if (success) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Cuenta verificada</h2>
            <p>Tu cuenta ha sido verificada exitosamente.</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>Ir al inicio de sesion</button>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="page auth-page">
      <article className="card">
        <header className="card-header">
          <div className="logo" aria-hidden="true">B</div>
          <h1>Verificar cuenta</h1>
          <p>Ingresa el codigo de 6 digitos que enviamos a tu correo</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="codigo">Codigo de verificacion</label>
            <input id="codigo" type="text" placeholder="123456" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} required aria-required="true" />
          </div>

          <Alert type="error">{error}</Alert>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <nav className="auth-footer">
          <p>
            No recibiste el codigo?{" "}
            <button type="button" className="btn-link" onClick={handleReenviar}>Reenviar codigo</button>
          </p>
        </nav>
      </article>
    </main>
  );
}

export default VerifyCode;
