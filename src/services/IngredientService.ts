import { Ingredient } from '../models/Ingredient'
import ServiceResponse from './ServiceResponse'
import { getRepository } from 'typeorm'

export default class IngredientService {
   /**
    * Finds ingredients in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with array of found ingredients.
    */
   static async find(searchBy?: { type?: string  }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.find(searchBy)

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
   }

   /**
    * Finds one ingredient in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with found ingredient object.
    */
   static async findOne(searchBy: { id: string, type?: string } | { id?: string, type: string }): Promise<ServiceResponse> {
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
   }

   /**
    * Saves the ingredient to the database.
    * 
    * @param item New ingredient object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with created ingredient object.
    */
   static async create(item: { type: string, name: string, description?: string }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const ingredient = new Ingredient()
         ingredient.type = item.type
         ingredient.name = item.name
         if (item.description) ingredient.description = item.description

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
   }

   /**
    * Updates the ingredient in the database.
    * 
    * @param item Updated ingredient object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with updated ingredient object.
    */
   static async update(item: { id: string, type?: string, name?: string, description?: string }): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const ingredient = await repository.findOne({ id: item.id })

         if (!ingredient) return { success: false, body: null, message: 'NOT_FOUND' }

         if (item.type) ingredient.type = item.type
         if (item.name) ingredient.name = item.name
         if (item.description) ingredient.description = item.description

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
   }

   /**
    * Removes specified ingredient from the database.
    * 
    * @param id id of the ingredient to be removed
    * @returns ServiceResponse object with 'success' property.
    */
   static async remove(id: string): Promise<ServiceResponse> {
      try {
         const repository = getRepository(Ingredient)

         const found = await repository.findOne({ id })

         if (!found) return { success: false, message: "NOT_FOUND" }

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
