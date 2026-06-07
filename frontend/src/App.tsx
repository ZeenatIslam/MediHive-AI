import Dashboard from './elements/Dashboard'
import Analytics from './elements/Analytics'
import Appoinments from './elements/Appoinments'
import Doctors from './elements/Doctors'
import Patients from './elements/Patients'
import Reports from './elements/Reports'
import Settings from './elements/Settings'
import { Routes, Route } from "react-router-dom"
import Emergency from './elements/Emergency'
import BedManagement from './elements/BedManagement'
import Assistant from './elements/Assistant'
import Layout from './Layout'
export function App() {
  return (
    <>

      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          {/* Clinical */}
          <Route path="appointments" element={<Appoinments />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="patients" element={<Patients />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="bedmanagement" element={<BedManagement />} />
          <Route path="assistant" element={<Assistant />} />
        </Route>
      </Routes>

    </>
  )
}

export default App
