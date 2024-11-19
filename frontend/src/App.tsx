import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import Landing from "./pages/Landing"
import Auth from "./pages/Auth"
import Dashboard from "./pages/Dashboard"
import CompositeBuilder from "@/pages/CompositeBuilder"
import CompositeEditor from "@/pages/CompositeEditor"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/composite-builder" element={<CompositeBuilder />} />
          <Route path="/composite-editor" element={<CompositeEditor />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
