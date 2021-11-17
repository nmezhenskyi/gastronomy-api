import { getRepository } from 'typeorm'
import { Ingredient } from '../models/ingredient'
import { ApiError } from '../exceptions/api-error'

export const IngredientService = {
   /**
    * Finds ingredients in the database that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offest Search offset.
    * @param limit Search limit.
    * @returns Array of found ingredients.
    */
   async find(searchBy?: { category?: string  }, offset = 0, limit = 30): Promise<Ingredient[]> {
      const repo = getRepository(Ingredient)

      const found = await repo.find({
         select: ['id', 'category', 'name', 'description'],
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })

      if (!found || !found.length) throw ApiError.NotFound('No ingredients were found')

      return found
   },

   /**
    * Finds one ingredient in the database that matches given conditions.
    * 
    * @param searchBy Search condition.
    * @returns Found ingredient.
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<Ingredient> {
      const repo = getRepository(Ingredient)

      const found = await repo.findOne({
         select: ['id', 'category', 'name', 'description'],
         where: searchBy
      })

      if (!found) throw ApiError.NotFound('Ingredient not found')

      return found
   },

   /**
    * Saves the ingredient to the database.
    * 
    * @param ingredientDto New ingredient information.
    * @returns Created ingredient.
    */
   async create(ingredientDto: { category: string, name: string, description?: string }): Promise<Ingredient> {
      const repo = getRepository(Ingredient)

      const ingredient = new Ingredient()
      ingredient.category = ingredientDto.category
      ingredient.name = ingredientDto.name
      if (ingredientDto.description) ingredient.description = ingredientDto.description

      const created = await repo.save(ingredient)

      return created
   },

   /**
    * Updates the ingredient in the database.
    * 
    * @param ingredientDto Ingredient id and updated information.
    * @returns Updated ingredient.
    */
   async update(ingredientDto: { id: string, category?: string, name?: string, description?: string }): Promise<Ingredient> {
      const repo = getRepository(Ingredient)

      const ingredient = await repo.findOne({ id: ingredientDto.id })

      if (!ingredient) throw ApiError.NotFound('Ingredient not found')

      if (ingredientDto.category) ingredient.category = ingredientDto.category
      if (ingredientDto.name) ingredient.name = ingredientDto.name
      if (ingredientDto.description) ingredient.description = ingredientDto.description

      const updated = await repo.save(ingredient)

      return updated
   },

   /**
    * Removes specified ingredient from the database.
    * 
    * @param id id of the ingredient to be removed.
    * @returns Removed ingredient.
    */
   async remove(id: string): Promise<Ingredient> {
      const repo = getRepository(Ingredient)

      const found = await repo.findOne({ id })

      if (!found) throw ApiError.NotFound('Ingredient not found')

      await repo.remove(found)

      return found
   }
}
