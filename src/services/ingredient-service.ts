import { getRepository } from 'typeorm'
import { Ingredient } from '../models/ingredient'
import { ServiceResponse } from './service-response'

const IngredientService = {
   /**
    * Finds ingredients in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with array of found ingredients.
    */
   async find(searchBy?: { category?: string  }, offset = 0, limit = 10): Promise<ServiceResponse<Ingredient[]>> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.find({
            where: searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })

         if (!found || found.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one ingredient in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with found ingredient object.
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<ServiceResponse<Ingredient>> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.findOne(searchBy)

         if (!found) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Saves the ingredient to the database.
    * 
    * @param ingredientDto New ingredient object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with created ingredient object.
    */
   async create(ingredientDto: { category: string, name: string, description?: string }): Promise<ServiceResponse<Ingredient>> {
      try {
         const repository = getRepository(Ingredient)

         const ingredient = new Ingredient()
         ingredient.category = ingredientDto.category
         ingredient.name = ingredientDto.name
         if (ingredientDto.description) ingredient.description = ingredientDto.description

         const saved = await repository.save(ingredient)

         return {
            success: true,
            message: 'CREATED',
            body: saved
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Updates the ingredient in the database.
    * 
    * @param ingredientDto Updated ingredient object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with updated ingredient object.
    */
   async update(ingredientDto: { id: string, category?: string, name?: string, description?: string }): Promise<ServiceResponse<Ingredient>> {
      try {
         const repository = getRepository(Ingredient)

         const ingredient = await repository.findOne({ id: ingredientDto.id })

         if (!ingredient) return { success: false, message: 'NOT_FOUND' }

         if (ingredientDto.category) ingredient.category = ingredientDto.category
         if (ingredientDto.name) ingredient.name = ingredientDto.name
         if (ingredientDto.description) ingredient.description = ingredientDto.description

         const saved = await repository.save(ingredient)

         return {
            success: true,
            message: 'UPDATED',
            body: saved
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes specified ingredient from the database.
    * 
    * @param id id of the ingredient to be removed
    * @returns ServiceResponse object with 'success' property.
    */
   async remove(id: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.findOne({ id })

         if (!found) return { success: false, message: 'NOT_FOUND' }

         await repository.remove(found)

         return {
            success: true,
            message: 'REMOVED',
            body: null
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }
}

export default IngredientService
