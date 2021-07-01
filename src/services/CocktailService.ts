import { Cocktail } from '../models/Cocktail'
import ServiceResponse from './ServiceResponse'
import { getRepository } from 'typeorm'

export default class CocktailService {
   /**
    * Finds cocktails in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with array of found cocktails.
    */
   static async find(searchBy?: { name?: string }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

         const found = await repository.find(searchBy)

         if (!found || found.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found,
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }

   /**
    * Finds one cocktail in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with found cocktail object.
    */
   static async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

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
   }

   /**
    * Saves the cocktail to the database.
    * 
    * @param item New cocktail object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with created cocktail object.
    */
   static async create(item: {
      name: string,
      description?: string,
      method: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

         const cocktail = new Cocktail()
         cocktail.name = item.name
         cocktail.method = item.method
         if (item.description) cocktail.description = item.description
         if (item.notesOnIngredients) cocktail.notesOnIngredients = item.notesOnIngredients
         if (item.notesOnExecution) cocktail.notesOnExecution = item.notesOnExecution
         if (item.notesOnTaste) cocktail.notesOnTaste = item.notesOnTaste

         const saved = await repository.save(cocktail)

         return {
            success: true,
            message: 'CREATED',
            body: saved,
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }

   /**
    * Updates the cocktail in the database.
    * 
    * @param item Updated cocktail object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with updated cocktail object.
    */
   static async update(item: {
      id: string,
      name?: string,
      description?: string,
      method?: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

         const cocktail = await repository.findOne({ id: item.id })

         if (!cocktail) return { success: false, message: 'NOT_FOUND' }

         if (item.name) cocktail.name = item.name
         if (item.method) cocktail.method = item.method
         if (item.description) cocktail.description = item.description
         if (item.notesOnIngredients) cocktail.notesOnIngredients = item.notesOnIngredients
         if (item.notesOnExecution) cocktail.notesOnExecution = item.notesOnExecution
         if (item.notesOnTaste) cocktail.notesOnTaste = item.notesOnTaste

         const saved = await repository.save(cocktail)

         return {
            success: true,
            message: 'UPDATED',
            body: saved,
         }
      }
      catch (err) {
         return { success: false, message: 'FAILED' }
      }
   }

   /**
    * @todo Add Ingredient, Remove Ingredient
    */

   /**
    * Removes specified ingredient from the database.
    * 
    * @param id id of the ingredient to be removed
    * @returns ServiceResponse object with 'success' property.
    */
   static async remove(id: string): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Cocktail)

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
