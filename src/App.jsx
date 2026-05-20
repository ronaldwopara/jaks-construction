import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import JaksConcrete from './JaksConcrete.jsx'
import Gallery from './Gallery.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<JaksConcrete />} />
          <Route path="/gallery/:slug" element={<Gallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
