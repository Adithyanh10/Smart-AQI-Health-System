import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { I18nProvider } from './context/I18nContext'
import { ProfileProvider } from './context/ProfileContext'
import { ToastProvider } from './components/Shared/Toast'
import { NavBar } from './components/Shared/NavBar'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ComparePage } from './pages/ComparePage'
import { DatasetPage } from './pages/DatasetPage'
import { ProfilePage } from './pages/ProfilePage'
import { MapPage } from './pages/MapPage'
import { TravelAdvisorPage } from './pages/TravelAdvisorPage'
import { VoiceCommandPage } from './pages/VoiceCommandPage'

function ProtectedLayout() {
  const session = localStorage.getItem('aqi_session')
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <I18nProvider>
          <ProfileProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/voice" element={<VoiceCommandPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/dataset" element={<DatasetPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/travel" element={<TravelAdvisorPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </ProfileProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
