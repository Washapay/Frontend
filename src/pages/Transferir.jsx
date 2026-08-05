import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function Transferir() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ destino: "", monto: "", moneda: "ARS" });
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmitStep1(e) {
    e.preventDefault();
    setError("");
    if (!form.destino || !form.monto) { setError("Todos los campos son obligatorios"); return; }
    if (Number(form.monto) <= 0) { setError("El monto debe ser mayor a 0"); return; }
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    setLoading(true);
    try {
      await apiRequest("/api/operaciones/transferir", {
        method: "POST",
        body: JSON.stringify({
          destino: form.destino, monto: Number(form.monto), moneda: form.moneda,
          usuario_origen_id: usuario.id, email_origen: usuario.email,
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
      await apiRequest("/api/operaciones/confirmar-transferencia", {
        method: "POST", body: JSON.stringify({ codigo, email: usuario.email }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Transferencia exitosa</h2>
            <p>El dinero fue enviado correctamente.</p>
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
          <h1>Transferir</h1>
          {step === 1 ? <p>Ingresa los datos del destinatario</p> : <p>Confirma con el codigo enviado a tu correo</p>}
        </header>

        <div className="steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2}>
          <span className={`step ${step === 1 ? "active" : "completed"}`}>1</span>
          <span className={`step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>2</span>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmitStep1} noValidate>
            <div className="form-group">
              <label htmlFor="destino">Email del destinatario</label>
              <input id="destino" name="destino" placeholder="usuario@email.com" value={form.destino} onChange={handleChange} required aria-required="true" />
            </div>
            <div className="form-group">
              <label htmlFor="monto">Monto</label>
              <input id="monto" name="monto" type="number" placeholder="0.00" value={form.monto} onChange={handleChange} min="1" required aria-required="true" />
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="moneda" value="ARS" checked={form.moneda === "ARS"} onChange={handleChange} />
                  <span>ARS $</span>
                </label>
                <label>
                  <input type="radio" name="moneda" value="USD" checked={form.moneda === "USD"} onChange={handleChange} />
                  <span>USD US$</span>
                </label>
              </div>
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
              {loading ? "Confirmando..." : "Confirmar transferencia"}
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

export default Transferir;
