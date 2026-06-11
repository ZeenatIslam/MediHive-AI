import Layout from "./Layout"
import Dashboard from "./elements/Dashboard"
import Analytics from "./elements/Analytics"
import Appoinments from "./elements/Appoinments"
import Doctors from "./elements/Doctors"
import Patients from "./elements/Patients"
import Reports from "./elements/Reports"
import Settings from "./elements/Settings"
import Emergency from "./elements/Emergency"
import BedManagement from "./elements/BedManagement"
import Assistant from "./elements/Assistant"
import LoginPage from "./authentication/login"
import ProtectedRoute from "./authentication/ProtectedRoute"
import { Routes, Route } from "react-router-dom"
import { Navigate } from "react-router-dom"
import Register from "./authentication/Register"
export function App() {
  return (
    <Routes>
       <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
       
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="appointments" element={<Appoinments />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="patients" element={<Patients />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="bedmanagement" element={<BedManagement />} />
        <Route path="assistant" element={<Assistant />} />
         {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

      </Route>
    </Routes>
  )
}

export default App