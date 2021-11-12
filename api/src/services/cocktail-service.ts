import { getRepository } from 'typeorm'
import { Cocktail } from '../models/cocktail'
import { CocktailToIngredient } from '../models/cocktail-to-ingredient'
import { ServiceResponse } from './utils/service-response'
import { IngredientService } from './ingredient-service'

export const CocktailService = {
   /**
    * Finds cocktails in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offset Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with array of found cocktails.
    */
   async find(searchBy?: { name?: string }, offset = 0, limit = 10): Promise<ServiceResponse<Cocktail[]>> {
      try {
         const repository = getRepository(Cocktail)

         const found = await repository.find({
            select: ['id', 'name', 'description', 'notesOnTaste'],
            where: searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })

         if (!found || found.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: found,
         }
      }
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one cocktail in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with found cocktail object.
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<ServiceResponse<Cocktail>> {
      try {
         const repository = getRepository(Cocktail)

         const found = await repository.createQueryBuilder('c')
            .select([
               'c.id', 'c.name', 'c.description', 'c.method',
               'c.notesOnIngredients', 'c.notesOnExecution', 'c.notesOnTaste'
            ])
            .addSelect(['cti.amount'])
            .addSelect(['i.id', 'i.name', 'i.category', 'i.description'])
            .where(`${
               (searchBy.id && searchBy.name) ? 'c.id = :id AND c.name = :name' :
               (searchBy.id ? 'c.id = :id' : (searchBy.name ? 'c.name = :name' : ''))
            }`, { id: searchBy.id, name: searchBy.name })
            .leftJoin('c.ingredients', 'cti')
            .leftJoin('cti.ingredient', 'i')
            .orderBy('cti.createdAt', 'DESC')
            .getOne()

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
    * Saves the cocktail to the database.
    * 
    * @param cocktailDto New cocktail object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with created cocktail object.
    */
   async create(cocktailDto: {
      name: string,
      description?: string,
      method: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse<Cocktail>> {
      try {
         const repository = getRepository(Cocktail)

         const cocktail = new Cocktail()
         cocktail.name = cocktailDto.name
         cocktail.method = cocktailDto.method
         if (cocktailDto.description) cocktail.description = cocktailDto.description
         if (cocktailDto.notesOnIngredients) cocktail.notesOnIngredients = cocktailDto.notesOnIngredients
         if (cocktailDto.notesOnExecution) cocktail.notesOnExecution = cocktailDto.notesOnExecution
         if (cocktailDto.notesOnTaste) cocktail.notesOnTaste = cocktailDto.notesOnTaste

         const saved = await repository.save(cocktail)

         return {
            success: true,
            message: 'CREATED',
            body: saved,
         }
      }
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Updates the cocktail in the database.
    * 
    * @param cocktailDto Updated cocktail object
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery with updated cocktail object.
    */
   async update(cocktailDto: {
      id: string,
      name?: string,
      description?: string,
      method?: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse<Cocktail>> {
      try {
         const repository = getRepository(Cocktail)

         const cocktail = await repository.findOne({ id: cocktailDto.id })

         if (!cocktail) return { success: false, message: 'NOT_FOUND' }

         if (cocktailDto.name) cocktail.name = cocktailDto.name
         if (cocktailDto.method) cocktail.method = cocktailDto.method
         if (cocktailDto.description) cocktail.description = cocktailDto.description
         if (cocktailDto.notesOnIngredients) cocktail.notesOnIngredients = cocktailDto.notesOnIngredients
         if (cocktailDto.notesOnExecution) cocktail.notesOnExecution = cocktailDto.notesOnExecution
         if (cocktailDto.notesOnTaste) cocktail.notesOnTaste = cocktailDto.notesOnTaste

         const saved = await repository.save(cocktail)

         return {
            success: true,
            message: 'UPDATED',
            body: saved,
         }
      }
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Adds the ingredient from the database to the cocktail in the database. 
    * 
    * @param cocktailId Cocktail id
    * @param ingredient Existing ingredient id or new ingredient object
    * @param amount Amount for the ingredient
    * @returns ServiceResponse object with 'success' property. If 'success' is true, then query was successful and the object has 'body' propery the with created record.
    */
   async addIngredient(cocktailId: string, ingredient: string | { category: string, name: string, description?: string },
   amount: string): Promise<ServiceResponse<CocktailToIngredient>> {
      try {
         const cocktailRepository = getRepository(Cocktail)
         const cocktail = await cocktailRepository.findOne({ id: cocktailId })
         if (!cocktail) return { success: false, message: 'NOT_FOUND' }

         let ingredientResponse: ServiceResponse<any>

         // Existing ingredient id is passed
         if (typeof ingredient === 'string')
            ingredientResponse = await IngredientService.findOne({ id: ingredient })
         // New ingredient object is passed
         else
            ingredientResponse = await IngredientService.create({ category: ingredient.category, name: ingredient.name, description: ingredient.description})

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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes the association between specified cocktail and ingredient from the database.
    * 
    * @param cocktailId Cocktail id
    * @param ingredientId Ingredient id
    * @returns ServiceResponse object with 'success' property.
    */
   async removeIngredient(cocktailId: string, ingredientId: string): Promise<ServiceResponse<null>> {
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes specified cocktail from the database.
    * 
    * @param id Id of the cocktail to be removed
    * @returns ServiceResponse object with 'success' property.
    */
   async remove(id: string): Promise<ServiceResponse<null>> {
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
      catch (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   }
}
