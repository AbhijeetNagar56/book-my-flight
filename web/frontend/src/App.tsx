import { Routes, Route } from 'react-router'
import { Toaster } from 'react-hot-toast'
import Home from './Home'
import Auth from './Auth'
import Profile from './Profile'

function App() {

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}

export default App
