import { Link } from 'react-router-dom'

// Styles:
import './navbar.css'

// Components:
import { Searchbar } from './searchbar'

export const Navbar = () => {
   return (
      <div className="navbar">
         <nav className="container">
            <div className="left">
               <Link to="/" className="logo">
                  <h1>Gastronomy</h1>
               </Link>
               <Link to="/meals">
                  Meals
               </Link>
               <Link to="/cocktails">
                  Cocktails
               </Link>
               <Link to="/recipes">
                  All
               </Link>
               <Searchbar />
            </div>
            <div className="right">
               <Link to="/login">
                  Login
               </Link>
               <Link to="/register">
                  Register
               </Link>
            </div>
         </nav>
      </div>
   )
}
