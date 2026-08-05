import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";
import Alert from "../components/Alert";

function CambiarMoneda() {
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loadingCotizacion, setLoadingCotizacion] = useState(true);
  const [tipoOperacion, setTipoOperacion] = useState("compra");
  const [montoUsd, setMontoUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchCotizacion() {
      try {
        const data = await apiRequest("/api/operaciones/cotizacion", { method: "GET" });
        setCotizacion(data);
      } catch (err) {
        setError("No se pudo obtener la cotizacion");
      } finally {
        setLoadingCotizacion(false);
      }
    }
    fetchCotizacion();
  }, []);

  function calcularArs() {
    if (!cotizacion || !montoUsd) return 0;
    const precio = tipoOperacion === "compra" ? cotizacion.venta : cotizacion.compra;
    return (Number(montoUsd) * precio).toFixed(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!montoUsd || Number(montoUsd) <= 0) { setError("Ingresa un monto valido"); return; }
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    setLoading(true);
    try {
      await apiRequest("/api/operaciones/cambio-moneda", {
        method: "POST",
        body: JSON.stringify({ tipoOperacion, montoUsd: Number(montoUsd), usuario_id: usuario.id }),
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) {
    return (
      <main className="page auth-page">
        <article className="card">
          <div className="success-page">
            <div className="check-icon" aria-hidden="true">✓</div>
            <h2>Operacion exitosa</h2>
            <p>El cambio de moneda se realizo correctamente.</p>
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
          <h1>Cambio de moneda</h1>
          <p>
            {cotizacion
              ? `Compra $${cotizacion.compra} · Venta $${cotizacion.venta}`
              : "Cargando cotizacion..."}
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Operacion</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="compra" checked={tipoOperacion === "compra"} onChange={(e) => setTipoOperacion(e.target.value)} />
                <span>Comprar USD</span>
              </label>
              <label>
                <input type="radio" value="venta" checked={tipoOperacion === "venta"} onChange={(e) => setTipoOperacion(e.target.value)} />
                <span>Vender USD</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="montoUsd">Monto en USD</label>
            <input id="montoUsd" type="number" placeholder="0.00" value={montoUsd} onChange={(e) => setMontoUsd(e.target.value)} min="1" required aria-required="true" />
          </div>

          {cotizacion && montoUsd && Number(montoUsd) > 0 && (
            <div className="calc-info" role="status" aria-live="polite">
              {tipoOperacion === "compra"
                ? <>Necesitas <strong>${calcularArs()} ARS</strong></>
                : <>Recibiras <strong>${calcularArs()} ARS</strong></>}
            </div>
          )}

          <Alert type="error">{error}</Alert>

          <button type="submit" className="btn btn-primary" disabled={loading || loadingCotizacion}>
            {loading && <Spinner />}
            {loading ? "Procesando..." : "Confirmar operacion"}
          </button>
        </form>

        <nav className="auth-footer">
          <p><Link to="/dashboard">Cancelar</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default CambiarMoneda;
