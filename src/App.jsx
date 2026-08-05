import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import VerifyCode from "./pages/VerifyCode";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Transferir from "./pages/Transferir";
import CargarDinero from "./pages/CargarDinero";
import PagarServicios from "./pages/PagarServicios";
import CambiarMoneda from "./pages/CambiarMoneda";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rutas protegidas (requieren estar logueado) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transferir"
          element={
            <ProtectedRoute>
              <Transferir />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cargar-dinero"
          element={
            <ProtectedRoute>
              <CargarDinero />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pagar-servicios"
          element={
            <ProtectedRoute>
              <PagarServicios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cambiar-moneda"
          element={
            <ProtectedRoute>
              <CambiarMoneda />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;