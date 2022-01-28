import { Routes, Route } from 'react-router-dom'

// Styles:
import './app.css'

// Components:
import { Navbar } from './components/navbar'
import { Home } from './views/home/home'
import { Footer } from './components/footer'

export const App = () => {
   return (
      <div className="app">
         <Navbar />
         <Routes>
            <Route path="/" element={<Home />} />
         </Routes>
         <Footer />
      </div>
   )
}
