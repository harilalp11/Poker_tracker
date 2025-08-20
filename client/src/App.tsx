import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Sessions } from "./pages/Sessions"
import { SessionDetail } from "./pages/SessionDetail"
import { HandRecorder } from "./pages/HandRecorder"
import { Analytics } from "./pages/Analytics"
import { Players } from "./pages/Players"
import { Settings } from "./pages/Settings"
import { BlankPage } from "./pages/BlankPage"

function App() {
  console.log('App: Rendering main App component');
  
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="sessions/:id" element={<SessionDetail />} />
              <Route path="sessions/:id/record-hand" element={<HandRecorder />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="players" element={<Players />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<BlankPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App