import { useState, useEffect, useRef } from "react";
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
  const [pwChecks, setPwChecks] = useState({ length: false, upper: false, number: false, special: false, match: false });
  const [qrActive, setQrActive] = useState(false);
  const [qrMessage, setQrMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    const pw = form.newPassword || "";
    setPwChecks({
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
      match: pw && form.confirmPassword && pw === form.confirmPassword,
    });
  }, [form.newPassword, form.confirmPassword]);

  // QR scan functions (camera + image upload)
  async function startQrScanLocal() {
    try {
      const jsQR = await ensureJsQR();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setQrActive(true);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const scanFrame = () => {
        if (!videoRef.current || videoRef.current.readyState !== 4) {
          streamRef.current._raf = requestAnimationFrame(scanFrame);
          return;
        }
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const result = processQrResult(code.data);
          setQrMessage(`QR detectado: tipo=${result.type}`);
          // stop on detection
          stopQrScanLocal();
        } else {
          streamRef.current._raf = requestAnimationFrame(scanFrame);
        }
      };
      streamRef.current._raf = requestAnimationFrame(scanFrame);
    } catch (err) {
      setQrMessage(`No se pudo acceder a la cámara: ${err.message || err}`);
      setQrActive(false);
    }
  }

  function stopQrScanLocal() {
    try {
      if (streamRef.current) {
        if (streamRef.current._raf) cancelAnimationFrame(streamRef.current._raf);
        stopStream(streamRef.current);
        streamRef.current = null;
      }
    } catch (e) {
      // ignore
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setQrActive(false);
  }

  async function handleImageUploadLocal(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const jsQR = await ensureJsQR();
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          const result = processQrResult(code.data);
          setQrMessage(`QR detectado: tipo=${result.type}`);
        } else {
          setQrMessage('No se detectó un QR en la imagen');
        }
      };
      const reader = new FileReader();
      reader.onload = (ev) => { img.src = ev.target.result; };
      reader.readAsDataURL(file);
    } catch (err) {
      setQrMessage(`Error procesando imagen: ${err.message || err}`);
    }
  }

  function validate() {
    if (!form.email || !form.codigo || !form.newPassword || !form.confirmPassword) return "Todos los campos son obligatorios";
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.number || !pwChecks.special) return "La contrasena no cumple los criterios de seguridad";
    if (!pwChecks.match) return "Las contrasenas no coinciden";
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
            <input id="newPassword" name="newPassword" type="password" placeholder="Min. 8 caracteres, mayúscula, número, símbolo" value={form.newPassword} onChange={handleChange} required aria-required="true" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>
            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repetir contrasena" value={form.confirmPassword} onChange={handleChange} required aria-required="true" />
          </div>

          <div style={{ marginBottom: 12, fontSize: 13 }} aria-live="polite">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <PwCheck label="Min. 8 caracteres" ok={pwChecks.length} />
              <PwCheck label="Mayúscula" ok={pwChecks.upper} />
              <PwCheck label="Número" ok={pwChecks.number} />
              <PwCheck label="Carácter especial" ok={pwChecks.special} />
              <PwCheck label="Coincide" ok={pwChecks.match} />
            </div>
          </div>

          <div style={{ marginTop: 6, borderTop: '1px dashed #eee', paddingTop: 8 }}>
            <h4 style={{ margin: '6px 0' }}>Lector QR (pagos)</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={startQrScanLocal} disabled={qrActive}>Abrir cámara</button>
              <button type="button" className="btn" onClick={stopQrScanLocal} disabled={!qrActive}>Cerrar cámara</button>
              <label className="btn" style={{ cursor: 'pointer' }}>
                Subir imagen
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUploadLocal(e)} />
              </label>
            </div>
            <div style={{ marginTop: 8 }}>
              {qrMessage && <div style={{ fontSize: 13 }}>{qrMessage}</div>}
              <div style={{ marginTop: 8 }}>
                <video ref={videoRef} style={{ width: 300, maxWidth: '100%', display: qrActive ? 'block' : 'none' }} muted playsInline />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>
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

  function PwCheck({ label, ok }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: ok ? '#e8f5e9' : '#fff3e0', color: ok ? '#2e7d32' : '#ff6f00' }}>
        <span aria-hidden>{ok ? '✓' : '•'}</span>
        <span style={{ fontSize: 13 }}>{label}</span>
      </div>
    );
  }

  // QR helpers
  async function ensureJsQR() {
    if (window.jsQR) return window.jsQR;
    // load from CDN
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
      s.onload = res; s.onerror = rej; document.body.appendChild(s);
    });
    return window.jsQR;
  }

  function stopStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  }

  function processQrResult(data) {
    // simple detection heuristics
    const lower = (data || '').toLowerCase();
    if (lower.includes('washa') || lower.includes('washapay') || lower.includes('/pago') || lower.includes('wallet=washapay')) {
      return { type: 'washapay', raw: data };
    }
    return { type: 'interbank', raw: data };
  }

  // no global wrappers; handlers are implemented above in component scope

export default ResetPassword;
