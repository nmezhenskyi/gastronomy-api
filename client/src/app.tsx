import { Routes, Route } from 'react-router-dom'

// Styles:
import './app.css'

// Components:
import { Navbar } from './components/navbar'
import { Home } from './views/home/home'
import { Login } from './views/login/login'
import { NotFound } from './views/not-found/not-found'
import { Footer } from './components/footer'

export const App = () => {
   return (
      <div className="app">
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
         </Routes>
         <Footer />
      </div>
   )
}
