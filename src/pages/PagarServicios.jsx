import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function PagarServicios() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ servicio: "Luz", codigoFactura: "", monto: "" });
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [comprobante, setComprobante] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmitStep1(e) {
    e.preventDefault();
    setError("");
    if (!form.codigoFactura || !form.monto) { setError("Todos los campos son obligatorios"); return; }
    if (Number(form.monto) <= 0) { setError("El monto debe ser mayor a 0"); return; }
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    setLoading(true);
    try {
      await apiRequest("/api/operaciones/pagar", {
        method: "POST",
        body: JSON.stringify({
          servicio: form.servicio, monto: Number(form.monto),
          usuario_id: usuario.id, email: usuario.email,
        }),
      });
      setStep(2);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleSubmitStep2(e) {
    e.preventDefault();
    setError("");
    if (!codigo) { setError("Ingresa el codigo de confirmacion"); return; }
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    setLoading(true);
    try {
      const data = await apiRequest("/api/operaciones/confirmar-pago", {
        method: "POST", body: JSON.stringify({ codigo, email: usuario.email }),
      });
      setComprobante(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (comprobante) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Pago realizado</h2>
            <p style={{ marginBottom: "8px" }}>Servicio: {form.servicio}</p>
            <p className="amount-display" style={{ color: "var(--color-danger)", fontSize: "28px" }}>${form.monto}</p>
            <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              {new Date(comprobante.comprobante?.fecha).toLocaleString("es-AR")}
            </p>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: "inline-block", marginTop: "16px" }}>Volver al inicio</Link>
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
          <h1>Pagar servicios</h1>
          {step === 1 ? <p>Selecciona el servicio a pagar</p> : <p>Confirma con el codigo enviado a tu correo</p>}
        </header>

        <div className="steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2}>
          <span className={`step ${step === 1 ? "active" : "completed"}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmitStep1} noValidate>
            <div className="form-group">
              <label htmlFor="servicio">Servicio</label>
              <select id="servicio" name="servicio" value={form.servicio} onChange={handleChange}>
                <option value="Luz">Luz</option>
                <option value="Gas">Gas</option>
                <option value="Internet">Internet</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="codigoFactura">Codigo de factura</label>
              <input id="codigoFactura" name="codigoFactura" placeholder="000-000-000" value={form.codigoFactura} onChange={handleChange} required aria-required="true" />
            </div>
            <div className="form-group">
              <label htmlFor="monto">Monto</label>
              <input id="monto" name="monto" type="number" placeholder="0.00" value={form.monto} onChange={handleChange} min="1" required aria-required="true" />
            </div>
            <Alert type="error">{error}</Alert>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Procesando..." : "Continuar"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitStep2} noValidate>
            <div className="form-group">
              <label htmlFor="codigo">Codigo de confirmacion</label>
              <input id="codigo" placeholder="123456" value={codigo} onChange={(e) => setCodigo(e.target.value)} required aria-required="true" />
            </div>
            <Alert type="error">{error}</Alert>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <Spinner />}
              {loading ? "Confirmando..." : "Confirmar pago"}
            </button>
          </form>
        )}

        <nav className="auth-footer">
          <p><Link to="/dashboard">Cancelar</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default PagarServicios;
