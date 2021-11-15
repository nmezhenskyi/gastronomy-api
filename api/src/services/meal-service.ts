import { getRepository, Like } from 'typeorm'
import { Meal } from '../models/meal'
import { MealToIngredient } from '../models/meal-to-ingredient'
import { IngredientService } from './ingredient-service'
import { ApiError } from '../exceptions/api-error'

export const MealService = {
   /**
    * Finds meals in the database that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found meals.
    */
   async find(searchBy?: {
      name?: string,
      cuisine?: string
   }, offset = 0, limit = 30): Promise<Meal[]> {
      const repo = getRepository(Meal)

      let searchName = searchBy !== undefined && searchBy.name !== undefined

      const found = await repo.find({
         select: ['id', 'name', 'cuisine', 'description'],
         where: searchName ? { ...searchBy, name: Like(`%${searchBy!.name}%`) } : searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })

      if (!found || found.length === 0) throw ApiError.NotFound('No meals were found')

      return found
   },

   /**
    * Finds one meal in the database that matches given conditions.
    * 
    * @param searchBy Search condition.
    * @returns Found meal.
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<Meal> {
      const repo = getRepository(Meal)

      const found = await repo.createQueryBuilder('m')
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

      if (!found) throw ApiError.NotFound('Meal not found')

      return found
   },

   /**
    * Saves the meal to the database.
    * 
    * @param mealDto New meal information.
    * @returns Created meal.
    */
   async create(mealDto: {
      name: string,
      description?: string,
      cuisine?: string,
      instructions: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<Meal> {
      const repo = getRepository(Meal)

      const meal = new Meal()
      meal.name = mealDto.name
      meal.instructions = mealDto.instructions
      if (mealDto.description) meal.description = mealDto.description
      if (mealDto.cuisine) meal.cuisine = mealDto.cuisine
      if (mealDto.notesOnIngredients) meal.notesOnIngredients = mealDto.notesOnIngredients
      if (mealDto.notesOnExecution) meal.notesOnExecution = mealDto.notesOnExecution
      if (mealDto.notesOnTaste) meal.notesOnTaste = mealDto.notesOnTaste

      const created = await repo.save(meal)

      return created
   },

   /**
    * Updates the meal in the database.
    * 
    * @param mealDto Meal id and updated information.
    * @returns Updated meal.
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
   }): Promise<Meal> {
      const repo = getRepository(Meal)

      const meal = await repo.findOne(mealDto.id)

      if (!meal) throw ApiError.NotFound('Meal not found')

      if (mealDto.name) meal.name = mealDto.name
      if (mealDto.description) meal.description = mealDto.description
      if (mealDto.cuisine) meal.cuisine = mealDto.cuisine
      if (mealDto.instructions) meal.instructions = mealDto.instructions
      if (mealDto.notesOnIngredients) meal.notesOnIngredients = mealDto.notesOnIngredients
      if (mealDto.notesOnExecution) meal.notesOnExecution = mealDto.notesOnExecution
      if (mealDto.notesOnTaste) meal.notesOnTaste = mealDto.notesOnTaste

      const updated = await repo.save(meal)

      return updated
   },

   /**
    * Adds the ingredient from the database to the meal in the database.
    * 
    * @param mealId Meal id.
    * @param ingredient Existing ingredient id or new ingredient object.
    * @param amount Amount for the ingredient.
    * @returns Added ingredient id and meal id.
    */
   async addIngredient(mealId: string, ingredient: string | { category: string, name: string, description?: string },
   amount: string): Promise<MealToIngredient> {
      const mealRepo = getRepository(Meal)
      const meal = await mealRepo.findOne(mealId)
      if (!meal) throw ApiError.NotFound('Meal not found')

      let ingredientToAdd

      // Existing ingredient id is passed
      if (typeof ingredient === 'string') {
         ingredientToAdd = await IngredientService.findOne({ id: ingredient })
      }   
      // New ingredient object is passed
      else {
         ingredientToAdd = await IngredientService.create({
            category: ingredient.category,
            name: ingredient.name,
            description: ingredient.description
         })
      }

      const mealToIngredientRepo = getRepository(MealToIngredient)
      const mealToIngredient = new MealToIngredient()
      mealToIngredient.meal = meal
      mealToIngredient.ingredient = ingredientToAdd
      mealToIngredient.amount = amount

      const created = await mealToIngredientRepo.save(mealToIngredient)

      return created
   },

   /**
    * Removes the association between specified meal and ingredient from the database.
    * 
    * @param mealId Meal id.
    * @param ingredientId Ingredient id.
    * @returns Removed ingredient id and meal id.
    */
   async removeIngredient(mealId: string, ingredientId: string): Promise<MealToIngredient> {
      const repo = getRepository(MealToIngredient)

      const found = await repo.findOne({ mealId, ingredientId })

      if (!found) throw ApiError.NotFound('Ingredient not found')

      await repo.remove(found)

      return found
   },

   /**
    * Removes specified meal from the database.
    * 
    * @param id Meal id.
    * @returns Removed meal.
    */
   async remove(id: string): Promise<Meal> {
      const repo = getRepository(Meal)

      const found = await repo.findOne(id)

      if (!found) throw ApiError.NotFound('Meal not found')

      await repo.remove(found)

      return found
   }
}
