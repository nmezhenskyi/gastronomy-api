import { Ingredient } from '../models/Ingredient'
import ServiceResponse from './ServiceResponse'
import { getRepository } from 'typeorm'

export default class IngredientService {
   /**
    * Saves the ingredient to the database.
    * @param item 
    * @returns 
    */
   static async create(item: { type: string, name: string, description?: string }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const ingredient = new Ingredient()
         ingredient.type = item.type
         ingredient.name = item.name
         if (item.description) ingredient.description = item.description

         const saved = await repository.save(ingredient)

         return { success: true, body: saved, message: 'Ingredient added'  }
      }
      catch (err) {
         return { success: false, message: err }
      }
   }

   /**
    * Finds ingredients in the database that match given conditions.
    * @param searchBy 
    * @returns 
    */
   static async find(searchBy?: { type?: string  }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.find(searchBy)

         if (!found || found.length === 0) return { success: true, body: null, message: 'Nothing found' }

         return { success: true, body: found }
      }
      catch (err) {
         return { success: false, message: err }
      }
   }

   /**
    * Removes specified ingredient from the database.
    * @param id 
    * @returns 
    */
   static async remove(id: string): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.findOne({ id })

         if (!found) return { success: false, message: 'Specified ingredient not found' }

         await repository.remove(found)

         return { success: true, message: 'Ingredient removed' }
      }
      catch (err) {
         return { success: false, message: err }
      }
   }
}
