import { getRepository, Like } from 'typeorm'
import { Meal } from '../models/meal'
import { MealToIngredient } from '../models/meal-to-ingredient'
import { ServiceResponse } from './utils/service-response'
import { IngredientService } from './ingredient-service'

export const MealService = {
   /**
    * Finds meals in the database that match given conditions.
    * 
    * @param searchBy Search condition
    * @param offset Search offset
    * @param limit Search limit
    * @returns ServiceResponse object with found meals
    */
   async find(searchBy?: {
      name?: string,
      cuisine?: string
   }, offset = 0, limit = 1): Promise<ServiceResponse<Meal[]>> {
      try {
         const repository = getRepository(Meal)

         let searchName = searchBy !== undefined && searchBy.name !== undefined

         const found = await repository.find({
            select: ['id', 'name', 'cuisine', 'description'],
            where: searchName ? { ...searchBy, name: Like(`%${searchBy!.name}%`) } : searchBy,
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
      catch  (err: unknown) {
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds one meal in the database that matches given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with found meal
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<ServiceResponse<Meal>> {
      try {
         const repository = getRepository(Meal)

         const found = await repository.createQueryBuilder('m')
            .select([
               'm.id', 'm.name', 'm.description', 'm.cuisine', 'm.instructions',
               'm.notesOnIngredients', 'm.notesOnExecution', 'm.notesOnTaste'
            ])
            .addSelect(['mti.amount'])
            .addSelect(['i.id', 'i.name', 'i.category', 'i.description'])
            .where(`${
               (searchBy.id && searchBy.name) ? 'm.id = :id AND m.name = :name' :
               (searchBy.id ? 'm.id = :id' : (searchBy.name ? 'm.name = :name' : ''))
            }`, { id: searchBy.id, name: searchBy.name })
            .leftJoin('m.ingredients', 'mti')
            .leftJoin('mti.ingredient', 'i')
            .orderBy('mti.createdAt', 'DESC')
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
    * Saves the meal to the database.
    * 
    * @param mealDto New meal object
    * @returns ServiceResponse object with created meal
    */
   async create(mealDto: {
      name: string,
      description?: string,
      cuisine?: string,
      instructions: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse<Meal>> {
      try {
         const repository = getRepository(Meal)

         const meal = new Meal()
         meal.name = mealDto.name
         meal.instructions = mealDto.instructions
         if (mealDto.description) meal.description = mealDto.description
         if (mealDto.cuisine) meal.cuisine = mealDto.cuisine
         if (mealDto.notesOnIngredients) meal.notesOnIngredients = mealDto.notesOnIngredients
         if (mealDto.notesOnExecution) meal.notesOnExecution = mealDto.notesOnExecution
         if (mealDto.notesOnTaste) meal.notesOnTaste = mealDto.notesOnTaste

         const saved = await repository.save(meal)

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
    * Updates the meal in the database.
    * 
    * @param mealDto Updated meal object
    * @returns ServiceRepsponse object with updated meal
    */
   async update(mealDto: {
      id: string,
      name?: string,
      description?: string,
      cuisine?: string,
      instructions?: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<ServiceResponse<Meal>> {
      try {
         const repository = getRepository(Meal)

         const meal = await repository.findOne(mealDto.id)

         if (!meal) return { success: false, message: 'NOT_FOUND' }

         if (mealDto.name) meal.name = mealDto.name
         if (mealDto.description) meal.description = mealDto.description
         if (mealDto.cuisine) meal.cuisine = mealDto.cuisine
         if (mealDto.instructions) meal.instructions = mealDto.instructions
         if (mealDto.notesOnIngredients) meal.notesOnIngredients = mealDto.notesOnIngredients
         if (mealDto.notesOnExecution) meal.notesOnExecution = mealDto.notesOnExecution
         if (mealDto.notesOnTaste) meal.notesOnTaste = mealDto.notesOnTaste

         const saved = await repository.save(meal)

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
    * Adds the ingredient from the database to the meal in the database.
    * 
    * @param mealId Meal id
    * @param ingredient Existing ingredient id or new ingredient object
    * @param amount Amount for the ingredient
    * @returns ServiceResponse object with created meal-to-ingredient
    */
   async addIngredient(mealId: string, ingredient: string | { category: string, name: string, description?: string },
   amount: string): Promise<ServiceResponse<MealToIngredient>> {
      try {
         const mealRepository = getRepository(Meal)
         const meal = await mealRepository.findOne(mealId)
         if (!meal) return { success: false, message: 'NOT_FOUND' }

         let ingredientResponse: ServiceResponse<any>

         // Existing ingredient id is passed
         if (typeof ingredient === 'string')
            ingredientResponse = await IngredientService.findOne({ id: ingredient })
         // New ingredient object is passed
         else
            ingredientResponse = await IngredientService.create({ category: ingredient.category, name: ingredient.name, description: ingredient.description})

         if (ingredientResponse.message === 'FAILED') return { success: false, message: 'FAILED' }
         if (ingredientResponse.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }

         const mealToIngredientRepository = getRepository(MealToIngredient)
         const mealToIngredient = new MealToIngredient()
         mealToIngredient.meal = meal
         mealToIngredient.ingredient = ingredientResponse.body
         mealToIngredient.amount = amount

         const saved = await mealToIngredientRepository.save(mealToIngredient)

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
    * Removes the association between specified meal and ingredient from the database.
    * 
    * @param mealId Meal id
    * @param ingredientId Ingredient id
    * @returns ServiceResponse object
    */
   async removeIngredient(mealId: string, ingredientId: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(MealToIngredient)

         const found = await repository.findOne({ mealId, ingredientId })

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
    * Removes specified meal from the database.
    * 
    * @param id Meal id
    * @returns ServiceResponse object
    */
   async remove(id: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(Meal)

         const found = await repository.findOne(id)

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
