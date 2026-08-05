import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import Spinner from "../components/Spinner";

function Dashboard() {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [saldoData, movData] = await Promise.all([
          apiRequest("/api/cuenta/saldo", { method: "GET" }),
          apiRequest("/api/cuenta/movimientos", { method: "GET" }),
        ]);
        setSaldo(saldoData);
        setMovimientos(movData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  }

  const tipoTexto = {
    deposito: "Deposito",
    transferencia_enviada: "Transferencia enviada",
    transferencia_recibida: "Transferencia recibida",
    pago: "Pago",
    compra_usd: "Compra USD",
    venta_usd: "Venta USD",
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <Spinner dark />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" role="banner">
        <h2><span className="logo-icon" aria-hidden="true">B</span> BurgerPay</h2>
        <button className="btn btn-sm btn-danger" onClick={handleLogout} aria-label="Cerrar sesion">Salir</button>
      </header>

      {error && (
        <div style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: "10px 16px", textAlign: "center", fontSize: "13px" }} role="alert">
          {error}
        </div>
      )}

      <main className="dashboard-content">
        {saldo && (
          <section className="balance-cards" aria-label="Saldos disponibles">
            <article className="balance-card">
              <p className="label">Pesos ARS</p>
              <p className="amount ars">${saldo.saldo_ars?.toLocaleString("es-AR")}</p>
              <p className="sub">Saldo disponible</p>
            </article>
            <article className="balance-card">
              <p className="label">Dolares USD</p>
              <p className="amount usd">US${saldo.saldo_usd?.toLocaleString("es-AR")}</p>
              <p className="sub">Saldo disponible</p>
            </article>
          </section>
        )}

        <nav className="action-grid" aria-label="Acciones rapidas">
          <Link to="/transferir" className="action-card">
            <div className="icon" aria-hidden="true">↗</div>
            <span className="action-label">Transferir</span>
          </Link>
          <Link to="/cargar-dinero" className="action-card">
            <div className="icon" aria-hidden="true">+</div>
            <span className="action-label">Cargar dinero</span>
          </Link>
          <Link to="/cambiar-moneda" className="action-card">
            <div className="icon" aria-hidden="true">⇄</div>
            <span className="action-label">Cambio moneda</span>
          </Link>
          <Link to="/pagar-servicios" className="action-card">
            <div className="icon" aria-hidden="true">📄</div>
            <span className="action-label">Pagar servicios</span>
          </Link>
        </nav>

        {movimientos.length > 0 && (
          <section className="movements-section" aria-label="Ultimos movimientos">
            <header className="movements-header">
              <h3>Ultimos movimientos</h3>
            </header>
            <div style={{ overflowX: "auto" }}>
              <table className="movements-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Mon</th>
                    <th style={{ textAlign: "right" }}>Monto</th>
                    <th style={{ textAlign: "right" }}>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.slice(0, 5).map((mov) => {
                    const fecha = new Date(mov.created_at);
                    const esHoy = new Date().toDateString() === fecha.toDateString();
                    return (
                      <tr key={mov.id}>
                        <td style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                          {esHoy
                            ? fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
                            : fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                        </td>
                        <td className="tipo">{tipoTexto[mov.tipo] || mov.tipo}</td>
                        <td>{mov.moneda}</td>
                        <td className={`monto ${mov.monto >= 0 ? "positivo" : "negativo"}`}>
                          {mov.monto >= 0 ? "+" : ""}{mov.monto}
                        </td>
                        <td className="saldo">{mov.saldo_resultante}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
