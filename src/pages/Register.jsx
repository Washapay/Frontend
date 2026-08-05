import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    if (!form.nombre || !form.email || !form.password || !form.confirmPassword) {
      return "Todos los campos son obligatorios";
    }
    if (form.password !== form.confirmPassword) return "Las contrasenas no coinciden";
    if (form.password.length < 6) return "La contrasena debe tener al menos 6 caracteres";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "El email no es valido";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre, email: form.email, password: form.password,
        }),
      });
      navigate(`/verify-code?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page auth-page">
      <article className="card">
        <header className="card-header">
          <div className="logo" aria-hidden="true">B</div>
          <h1>Crear cuenta</h1>
          <p>Registrate en BurgerPay</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contrasena</label>
            <input id="password" name="password" type="password" placeholder="Min. 6 caracteres" value={form.password} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetir contrasena" value={form.confirmPassword} onChange={handleChange} required aria-required="true" />
          </div>

          <Alert type="error">{error}</Alert>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <nav className="auth-footer" aria-label="Navegacion">
          <p>
            Ya tenes cuenta? <Link to="/">Inicia sesion</Link>
          </p>
        </nav>
      </article>
    </main>
  );
}

export default Register;
