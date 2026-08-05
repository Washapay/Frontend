import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [form, setForm] = useState({ email: emailParam, codigo: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.email || !form.codigo || !form.newPassword || !form.confirmPassword) return "Todos los campos son obligatorios";
    if (form.newPassword !== form.confirmPassword) return "Las contrasenas no coinciden";
    if (form.newPassword.length < 6) return "La contrasena debe tener al menos 6 caracteres";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      await apiRequest("/api/auth/resetear", {
        method: "POST",
        body: JSON.stringify({ email: form.email, codigo: form.codigo, nueva_password: form.newPassword }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Contrasena actualizada</h2>
            <p>Ya podes ingresar con tu nueva contrasena.</p>
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
          <h1>Restablecer contrasena</h1>
          {emailParam && (
            <div style={{ background: "#e8f5e9", color: "#2e7d32", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginTop: "8px" }} role="status">
              Te enviamos un codigo a <strong>{emailParam}</strong>
            </div>
          )}
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} readOnly tabIndex={-1} aria-readonly="true" />
          </div>
          <div className="form-group">
            <label htmlFor="codigo">Codigo recibido</label>
            <input id="codigo" name="codigo" placeholder="123456" value={form.codigo} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva contrasena</label>
            <input id="newPassword" name="newPassword" type="password" placeholder="Min. 6 caracteres" value={form.newPassword} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetir contrasena" value={form.confirmPassword} onChange={handleChange} required aria-required="true" />
          </div>

          <Alert type="error">{error}</Alert>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Actualizando..." : "Actualizar contrasena"}
          </button>
        </form>

        <nav className="auth-footer">
          <p><Link to="/">Volver al login</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default ResetPassword;
