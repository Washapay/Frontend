import { useState, useEffect, useRef } from "react";
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
  const [referencia, setReferencia] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [qrSrc, setQrSrc] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    async function fetchCotizacion() {
      try {
        const data = await apiRequest("/api/operaciones/cotizacion", { method: "GET" });
        // Support proxy returning structure { usd: { compra, venta }, eur: {...} } or { compra, venta }
        if (data?.usd) setCotizacion(data.usd);
        else setCotizacion(data);
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

  // configuration for fees/taxes
  const COMMISSION_PERCENT = 0.01; // 1% comisión
  const TAX_PERCENT = 0.30; // 30% impuestos (ejemplo, configurable según negocio)
  const LOCK_SECONDS = 15;

  function calcularDetalles() {
    if (!cotizacion || !montoUsd || Number(montoUsd) <= 0) return null;
    const precio = tipoOperacion === "compra" ? cotizacion.venta : cotizacion.compra;
    const base = Number(montoUsd) * precio;
    const commission = base * COMMISSION_PERCENT;
    const taxes = base * TAX_PERCENT;
    const total = tipoOperacion === "compra" ? base + commission + taxes : Math.max(0, base - commission - taxes);
    return {
      precio,
      base: Number(base.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!montoUsd || Number(montoUsd) <= 0) { setError("Ingresa un monto valido"); return; }
    // Require lock to be active (user must start the operation and confirm within 15s)
    if (!lockedUntil || Date.now() > lockedUntil) {
      setError(`Debes iniciar la operación y confirmar dentro de ${LOCK_SECONDS} segundos`);
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const detalles = calcularDetalles();
    setLoading(true);
    try {
      await apiRequest("/api/operaciones/cambio-moneda", {
        method: "POST",
        body: JSON.stringify({
          tipoOperacion,
          montoUsd: Number(montoUsd),
          usuario_id: usuario.id,
          referencia,
          destinatario,
          total_ars: detalles?.total,
        }),
      });
      setSuccess(true);
      setLockedUntil(null);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleStartLock(e) {
    e.preventDefault();
    setError("");
    if (!montoUsd || Number(montoUsd) <= 0) { setError("Ingresa un monto valido para iniciar la operación"); return; }
    const until = Date.now() + LOCK_SECONDS * 1000;
    setLockedUntil(until);
    setSecondsLeft(LOCK_SECONDS);
  }

  // Countdown effect for lock
  useEffect(() => {
    if (!lockedUntil) {
      setSecondsLeft(0);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }

    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setLockedUntil(null);
      }
    }, 250);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [lockedUntil]);

  function generarQr() {
    const detalles = calcularDetalles();
    if (!detalles) { setError("No hay detalles para generar QR"); return; }
    const ngrokBase = window.NGROK_URL || window.API_URL || "";
    const payloadUrl = `${ngrokBase}/pago?monto=${encodeURIComponent(detalles.total)}&moneda=ARS&ref=${encodeURIComponent(referencia || "-")}&dest=${encodeURIComponent(destinatario || "-")}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payloadUrl)}`;
    setQrSrc(qr);
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
            <input id="montoUsd" type="number" placeholder="0.00" value={montoUsd} onChange={(e) => setMontoUsd(e.target.value)} min="1" required aria-required="true" disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="referencia">Referencia / Concepto</label>
            <input id="referencia" type="text" placeholder="Referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="destinatario">Destinatario</label>
            <input id="destinatario" type="text" placeholder="Nombre o alias" value={destinatario} onChange={(e) => setDestinatario(e.target.value)} disabled={loading} />
          </div>

          {cotizacion && montoUsd && Number(montoUsd) > 0 && (
            (() => {
              const d = calcularDetalles();
              if (!d) return null;
              return (
                <div className="calc-info" role="status" aria-live="polite">
                  <div>Precio USD: <strong>${d.precio}</strong></div>
                  <div>Base: <strong>${d.base} ARS</strong></div>
                  <div>Comisión ({Math.round(COMMISSION_PERCENT * 100)}%): <strong>${d.commission} ARS</strong></div>
                  <div>Impuestos ({Math.round(TAX_PERCENT * 100)}%): <strong>${d.taxes} ARS</strong></div>
                  {tipoOperacion === "compra"
                    ? <div>Necesitas <strong>${d.total} ARS</strong></div>
                    : <div>Recibirás <strong>${d.total} ARS</strong></div>}
                </div>
              );
            })()
          )}

          {lockedUntil ? (
            <div className="lock-info">
              <p>La cotización está bloqueada. Tiempo restante: <strong>{secondsLeft}s</strong></p>
            </div>
          ) : (
            <div className="hint">Pulsa <strong>Iniciar operación</strong> para congelar la cotización {LOCK_SECONDS}s.</div>
          )}

          <Alert type="error">{error}</Alert>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn" onClick={handleStartLock} disabled={loading || loadingCotizacion || !montoUsd}>
              Iniciar operación
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || loadingCotizacion || !lockedUntil}>
              {loading && <Spinner />}
              {loading ? "Procesando..." : "Confirmar"}
            </button>
            <button type="button" className="btn" onClick={generarQr} disabled={!montoUsd || loading}>
              Generar QR
            </button>
          </div>

          {qrSrc && (
            <div className="qr-box" style={{ marginTop: 12 }}>
              <img src={qrSrc} alt="QR de pago" style={{ width: 200, height: 200 }} />
              <p>Escanea para abrir el pago (ngrok).</p>
            </div>
          )}
        </form>

        <nav className="auth-footer">
          <p><Link to="/dashboard">Cancelar</Link></p>
        </nav>
      </article>
    </main>
  );
}

export default CambiarMoneda;
