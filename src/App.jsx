import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Login from "./components/Login";

// Pages
import DashboardPage from "./pages/DashboardPage";
import StudentIncidentPage from "./pages/StudentIncidentPage";
import ViolationPage from "./pages/ViolationPage";
import SanctionPage from "./pages/SanctionPage";
import DepartmentPage from "./pages/DepartmentPage";
import GradePage from "./pages/GradePage";
import SectionPage from "./pages/SectionPage";
import StrandPage from "./pages/StrandPage";
import UserPage from "./pages/UserPage";
import ReportPage from "./pages/ReportPage";
import IncidentPage from "./pages/IncidentPage"; // ✅ New import

import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  function handleLogin(userInfo) {
    setUser(userInfo);
  }

  function handleLogout() {
    setUser(null);
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="app-container">
          <Sidebar onLogout={handleLogout} />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/" element={<StudentIncidentPage />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />
              <Route path="/student-incident" element={<StudentIncidentPage />} />
              <Route path="/violation" element={<ViolationPage />} />
              <Route path="/sanction" element={<SanctionPage />} />
              <Route path="/department" element={<DepartmentPage />} />
              <Route path="/grade" element={<GradePage />} />
              <Route path="/section" element={<SectionPage />} />
              <Route path="/strand" element={<StrandPage />} />
              <Route path="/user" element={<UserPage />} />
              <Route path="/report" element={<ReportPage />} />

              <Route path="/incident" element={<IncidentPage />} /> {/* ✅ Added route */}

              <Route path="*" element={<h2>Page not found</h2>} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;
