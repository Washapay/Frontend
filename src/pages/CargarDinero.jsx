import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function CargarDinero() {
  const navigate = useNavigate();
  const [moneda, setMoneda] = useState("ARS");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [nuevoSaldo, setNuevoSaldo] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!monto || Number(monto) <= 0) { setError("Ingresa un monto valido"); return; }
    setLoading(true);
    try {
      const data = await apiRequest("/api/cuenta/ingreso", {
        method: "POST",
        body: JSON.stringify({ moneda, monto: Number(monto) }),
      });
      setNuevoSaldo(data.nuevo_saldo);
      setSuccess(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Dinero cargado</h2>
            <p className="amount-display" style={{ color: moneda === "ARS" ? "var(--color-primary)" : "var(--color-success)" }}>
              {moneda === "ARS" ? "$" : "US$"}{nuevoSaldo}
            </p>
            <p>Nuevo saldo en {moneda}</p>
            <button className="btn btn-primary" onClick={() => navigate("/dashboard")} style={{ marginTop: "16px" }}>Volver al inicio</button>
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
          <h1>Cargar dinero</h1>
          <p>Ingresa fondos a tu cuenta</p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Moneda</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="ARS" checked={moneda === "ARS"} onChange={(e) => setMoneda(e.target.value)} />
                <span>ARS $</span>
              </label>
              <label>
                <input type="radio" value="USD" checked={moneda === "USD"} onChange={(e) => setMoneda(e.target.value)} />
                <span>USD US$</span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="monto">Monto a cargar</label>
            <input id="monto" type="number" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} min="1" required aria-required="true" />
          </div>

          <Alert type="error">{error}</Alert>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Cargando..." : "Cargar dinero"}
          </button>
        </form>

        <nav className="auth-footer">
          <p><Link to="/dashboard">Volver</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default CargarDinero;
