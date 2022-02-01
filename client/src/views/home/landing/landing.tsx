// Styles:
import './landing.css'
// Images:
import landing from '../../../assets/img/landing-1920x1080.jpg'

export const Landing = () => {
   return (
      <section id="landing" style={landingBackground}>
         <div className="container">
            <h1>Gastronomy - Meals & Cocktails</h1>
            <p>You can find a perfect recipe for any occasion here</p>
         </div>
      </section>
   )
}

const landingBackground = {
   background: `url(${landing}) no-repeat center center/cover`
}
