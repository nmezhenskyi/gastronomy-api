import { getRepository } from 'typeorm'
import { Cocktail } from '../models/cocktail'
import { CocktailToIngredient } from '../models/cocktail-to-ingredient'
import { IngredientService } from './ingredient-service'
import { ApiError } from '../exceptions/api-error'

export const CocktailService = {
   /**
    * Finds cocktails in the database that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found cocktails.
    */
   async find(searchBy?: { name?: string }, offset = 0, limit = 30): Promise<Cocktail[]> {
      const repo = getRepository(Cocktail)

      const found = await repo.find({
         select: ['id', 'name', 'description', 'notesOnTaste'],
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })

      if (!found || !found.length) throw ApiError.NotFound('No cocktails were found')

      return found
   },

   /**
    * Finds one cocktail in the database that matches given conditions.
    * 
    * @param searchBy Search condition.
    * @returns Found cocktail.
    */
   async findOne(searchBy: { id: string, name?: string } | { id?: string, name: string }): Promise<Cocktail> {
      const repo = getRepository(Cocktail)

      const found = await repo.createQueryBuilder('c')
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

      if (!found) throw ApiError.NotFound('Cocktail not found')

      return found
   },

   /**
    * Saves new cocktail to the database.
    * 
    * @param cocktailDto New cocktail information.
    * @returns Created cocktail.
    */
   async create(cocktailDto: {
      name: string,
      description?: string,
      method: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<Cocktail> {
      const repo = getRepository(Cocktail)

      const cocktail = new Cocktail()
      cocktail.name = cocktailDto.name
      cocktail.method = cocktailDto.method
      if (cocktailDto.description) cocktail.description = cocktailDto.description
      if (cocktailDto.notesOnIngredients) cocktail.notesOnIngredients = cocktailDto.notesOnIngredients
      if (cocktailDto.notesOnExecution) cocktail.notesOnExecution = cocktailDto.notesOnExecution
      if (cocktailDto.notesOnTaste) cocktail.notesOnTaste = cocktailDto.notesOnTaste

      const created = await repo.save(cocktail)

      return created
   },

   /**
    * Updates the cocktail in the database.
    * 
    * @param cocktailDto Cocktail id and updated information.
    * @returns Updated cocktail.
    */
   async update(cocktailDto: {
      id: string,
      name?: string,
      description?: string,
      method?: string,
      notesOnIngredients?: string,
      notesOnExecution?: string,
      notesOnTaste?: string
   }): Promise<Cocktail> {
      const repo = getRepository(Cocktail)

      const cocktail = await repo.findOne({ id: cocktailDto.id })

      if (!cocktail) throw ApiError.NotFound('Cocktail not found')

      if (cocktailDto.name) cocktail.name = cocktailDto.name
      if (cocktailDto.method) cocktail.method = cocktailDto.method
      if (cocktailDto.description) cocktail.description = cocktailDto.description
      if (cocktailDto.notesOnIngredients) cocktail.notesOnIngredients = cocktailDto.notesOnIngredients
      if (cocktailDto.notesOnExecution) cocktail.notesOnExecution = cocktailDto.notesOnExecution
      if (cocktailDto.notesOnTaste) cocktail.notesOnTaste = cocktailDto.notesOnTaste

      const updated = await repo.save(cocktail)

      return updated
   },

   /**
    * Adds the ingredient from the database to the cocktail in the database. 
    * 
    * @param cocktailId Cocktail id.
    * @param ingredient Existing ingredient id or new ingredient object.
    * @param amount Amount for the ingredient.
    * @returns Added ingredient id and cocktail id.
    */
   async addIngredient(cocktailId: string, ingredient: string | { category: string, name: string, description?: string },
   amount: string): Promise<CocktailToIngredient> {
      const cocktailRepo = getRepository(Cocktail)
      const cocktail = await cocktailRepo.findOne({ id: cocktailId })
      if (!cocktail) throw ApiError.NotFound('Cocktail not found')

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

      const cocktailToIngredientRepo = getRepository(CocktailToIngredient)
      const cocktailToIngredient = new CocktailToIngredient()
      cocktailToIngredient.cocktail = cocktail
      cocktailToIngredient.ingredient = ingredientToAdd
      cocktailToIngredient.amount = amount

      const created = await cocktailToIngredientRepo.save(cocktailToIngredient)

      return created
   },

   /**
    * Removes the association between specified cocktail and ingredient from the database.
    * 
    * @param cocktailId Cocktail id.
    * @param ingredientId Ingredient id.
    * @returns Removed ingredient id and cocktail id.
    */
   async removeIngredient(cocktailId: string, ingredientId: string): Promise<CocktailToIngredient> {
      const repo = getRepository(CocktailToIngredient)

      const found = await repo.findOne({ cocktailId, ingredientId })

      if (!found) throw ApiError.NotFound('Ingredient not found')

      await repo.remove(found)

      return found
   },

   /**
    * Removes specified cocktail from the database.
    * 
    * @param id Id of the cocktail to remove.
    * @returns Removed cocktail.
    */
   async remove(id: string): Promise<Cocktail> {
      const repo = getRepository(Cocktail)

      const found = await repo.findOne({ id })

      if (!found) throw ApiError.NotFound('Cocktail not found')

      await repo.remove(found)

      return found
   }
}
