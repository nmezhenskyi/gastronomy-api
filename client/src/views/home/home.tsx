import { useRequest } from '../../hooks/use-request'

// Components:
import { Landing } from './landing/landing'
import { RecipeGallery } from '../../components/recipe-gallery'

export const Home = () => {
   const { response: recipes, isPending, error } = useRequest({
      method: 'GET',
      url: 'http://localhost:5000/cocktails'
   })

   return (
      <>
         <Landing />
         <RecipeGallery recipes={recipes} isPending={isPending} error={error} />
      </>
   )
}
