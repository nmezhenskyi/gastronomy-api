// Styles:
import './footer.css'

export const Footer = () => {
   return (
      <footer>
         <div className="container">
            <p className="copyright">&copy; {new Date().getFullYear()} Gastronomy. Developed by Nikita Mezhenskyi.</p>
         </div>
      </footer>
   )
}
