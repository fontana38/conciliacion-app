import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import UploadPage from './pages/UploadPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'
import './components/buttons.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/historial" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
