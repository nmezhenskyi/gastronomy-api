import { getRepository } from 'typeorm'
import { Cocktail } from '../models/Cocktail'
import { CocktailToIngredient } from '../models/CocktailToIngredient'
import ServiceResponse from './ServiceResponse'
import IngredientService from './IngredientService'

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

         const found = await repository.find({
            select: ['id', 'name', 'description', 'notesOnTaste'],
            where: searchBy
         })

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

         const found = await repository.createQueryBuilder('c')
            .select([
               'c.id', 'c.name', 'c.description', 'c.method',
               'c.notesOnIngredients', 'c.notesOnExecution', 'c.notesOnTaste'
            ])
            .addSelect(['cti.amount'])
            .addSelect(['i.id', 'i.name', 'i.type', 'i.description'])
            .where(`${
               (searchBy.id && searchBy.name) ? 'c.id = :id AND c.name = :name' :
               (searchBy.id ? 'c.id = :id' : (searchBy.name ? 'c.name = :name' : ''))
            }`, { id: searchBy.id, name: searchBy.name })
            .innerJoin('c.ingredients', 'cti')
            .innerJoin('cti.ingredient', 'i')
            .getOne()

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
    * Adds the ingredient from the database to the cocktail in the database. 
    * 
    * @param cocktailId Cocktail id
    * @param ingredient Existing ingredient id or new ingredient object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery the with created record.
    */
   static async addIngredient(cocktailId: string, ingredient: string | { type: string, name: string, description?: string },
   amount: string): Promise<ServiceResponse> {
      try {
         const cocktailRepository = getRepository(Cocktail)
         const cocktail = await cocktailRepository.findOne({ id: cocktailId })
         if (!cocktail) return { success: false, message: 'NOT_FOUND' }

         let ingredientResponse: ServiceResponse

         // Existing ingredient id is passed
         if (typeof ingredient === 'string')
            ingredientResponse = await IngredientService.findOne({ id: ingredient })
         // New ingredient object is passed
         else
            ingredientResponse = await IngredientService.create({ type: ingredient.type, name: ingredient.name, description: ingredient.description})

         if (ingredientResponse.message === 'FAILED') return { success: false, message: 'FAILED' }
         if (ingredientResponse.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }

         const cocktailToIngredientRepository = getRepository(CocktailToIngredient)
         const cocktailToIngredient = new CocktailToIngredient()
         cocktailToIngredient.cocktail = cocktail
         cocktailToIngredient.ingredient = ingredientResponse.body
         cocktailToIngredient.amount = amount

         const saved = await cocktailToIngredientRepository.save(cocktailToIngredient)

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
    * Removes the association between specified cocktail and ingredient from the database.
    * 
    * @param cocktailId Cocktail id
    * @param ingredientId Ingredient id
    * @returns ServiceResponse object with 'success' property.
    */
   static async removeIngredient(cocktailId: string, ingredientId: string): Promise<ServiceResponse> {
      try {
         const repository = getRepository(CocktailToIngredient)

         const found = await repository.findOne({ cocktailId, ingredientId })

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
