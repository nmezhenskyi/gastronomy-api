import { Link } from 'react-router-dom'

// Styles:
import './recipe-gallery.css'

interface Recipe {
   id: string
   name: string
   description: string | null
   method: string
   notesOnIngredients?: string | null
   notesOnExecution?: string | null
   notesOnTaste?: string | null
}

interface Props {
   recipes: Recipe[]
   isPending: boolean
   error: string | null
}

export const RecipeGallery = ({ recipes, isPending, error }: Props) => {
   if (!recipes || recipes.length === 0) {
      return (
         <section className="recipe-gallery">
            <div className="container">
               <h3 className="error">No recipes were found</h3>
            </div>
         </section>
      )
   }

   return (
      <section className="recipe-gallery">
         <div className="container">
            {isPending && <p className="loading">Loading...</p> }
            {error && <p className="error">{error}</p>}
            {recipes && recipes.map(recipe => (
               <div key={recipe.id} className="recipe-card">
                  <h3>{recipe.name}</h3>
                  <p>{recipe.description}</p>
                  <Link to={`#`}>Read More</Link>
               </div>
            ))}
         </div>
      </section>
   )
}
