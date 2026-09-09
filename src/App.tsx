import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Policy from './pages/Policy'
import Industry from './pages/Industry'
import Submit from './pages/Submit'
import Crawl from './pages/Crawl'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/industry" element={<Industry />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/crawl" element={<Crawl />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
