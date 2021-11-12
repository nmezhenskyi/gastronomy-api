import { getRepository } from 'typeorm'
import { Ingredient } from '../models/ingredient'
import { ServiceResponse } from './utils/service-response'

export const IngredientService = {
   /**
    * Finds ingredients in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offest Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with array of found ingredients
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one ingredient in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with found ingredient
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Saves the ingredient to the database.
    * 
    * @param ingredientDto New ingredient object
    * @returns ServiceResponse object with created ingredient
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Updates the ingredient in the database.
    * 
    * @param ingredientDto Updated ingredient object
    * @returns ServiceResponse object with updated ingredient
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes specified ingredient from the database.
    * 
    * @param id id of the ingredient to be removed
    * @returns ServiceResponse object
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   }
}
