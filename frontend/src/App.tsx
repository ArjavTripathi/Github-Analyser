import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/components/Navbar'
import { Landing } from '@/pages/Landing'
import { Profile } from '@/pages/Profile'
import { AuthCallback } from '@/pages/AuthCallback'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ fontFamily: 'var(--app-font, system-ui, sans-serif)' }}>
        <Routes>
          {/* Landing — no navbar needed */}
          <Route path="/" element={<Landing />} />
          {/* Auth callback — no navbar */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Profile and Settings — show navbar */}
          <Route
            path="/:username"
            element={
              <>
                <Navbar />
                <Profile />
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <Navbar />
                <Settings />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
