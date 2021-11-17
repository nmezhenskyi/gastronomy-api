import { getRepository } from 'typeorm'
import { MealReview } from '../models/meal-review'
import { CocktailReview } from '../models/cocktail-review'
import { MealService } from './meal-service'
import { CocktailService } from './cocktail-service'
import { UserService } from './user-service'
import { ApiError } from '../exceptions/api-error'

export const ReviewService = {
   /**
    * Saves meal review.
    * 
    * @param mealId Meal id.
    * @param userId User id.
    * @param body New meal review.
    * @returns Created meal review.
    */
    async createMealReview(userId: string, mealId: string, body: {
      rating: number,
      review: string
   }): Promise<MealReview> {
      const meal = await MealService.findOne({ id: mealId })
      const user = await UserService.findOne({ id: userId })

      if (body.rating < 0 || body.rating > 5) throw ApiError.BadRequest('Invalid rating')

      const repository = getRepository(MealReview)
      const mealReview = new MealReview()
      mealReview.meal = meal
      mealReview.user = user
      mealReview.rating = body.rating
      mealReview.review = body.review
      const created = await repository.save(mealReview)

      return created
   },

   /**
    * Updates meal review.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @param body Updated meal review.
    * @returns Updated meal review.
    */
   async updateMealReview(userId: string, mealId: string, body: {
      rating?: number,
      review?: string
   }): Promise<MealReview> {
      const repository = getRepository(MealReview)
      const mealReview = await repository.findOne({ where: { userId, mealId } })
      if (!mealReview) throw ApiError.NotFound('Meal review not found')
      if (body.rating) {
         if (body.rating < 0 || body.rating > 5) throw ApiError.BadRequest('Invalid rating')
         mealReview.rating = body.rating
      }
      if (body.review) mealReview.review = body.review
      const saved = await repository.save(mealReview)

      return saved
   },

   /**
    * Removes meal review.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns Removed meal review.
    */
   async removeMealReview(userId: string, mealId: string): Promise<MealReview> {
         const repository = getRepository(MealReview)
         const mealReview = await repository.findOne({ where: { userId, mealId } })
         if (!mealReview) throw ApiError.NotFound('Meal review not found')
         await repository.remove(mealReview)

         return mealReview
   },

   /**
    * Finds meal review by user id and meal id.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns Found meal review.
    */
   async findOneMealReview(userId: string, mealId: string): Promise<MealReview> {
      const repository = getRepository(MealReview)
      const review = await repository.findOne({ where: { userId, mealId } })
      if (!review) throw ApiError.NotFound('Meal review not found')

      return review
   },

   /**
    * Finds meal reviews that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found meal reviews.
    */
   async findMealReviews(searchBy?: { userId?: string, mealId?: string }, offset = 0, limit = 50): Promise<MealReview[]> {
      const repository = getRepository(MealReview)
      const reviews = await repository.find({
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })
      if (!reviews || !reviews.length) throw ApiError.NotFound('No meal reviews were found')

      return reviews
   },

   /**
    * Saves cocktail review.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @param body New cocktail review.
    * @returns Created cocktail review.
    */
   async createCocktailReview(userId: string, cocktailId: string, body: {
      rating: number,
      review: string
   }): Promise<CocktailReview> {
      const cocktail = await CocktailService.findOne({ id: cocktailId })
      const user = await UserService.findOne({ id: userId })

      if (body.rating < 0 || body.rating > 5) throw ApiError.BadRequest('Invalid rating')

      const repository = getRepository(CocktailReview)
      const cocktailReview = new CocktailReview()
      cocktailReview.cocktail = cocktail
      cocktailReview.user = user
      cocktailReview.rating = body.rating
      cocktailReview.review = body.review
      const created = await repository.save(cocktailReview)

      return created
   },

   /**
    * Updates cocktail review.
    * 
    * @param userId User id.
    * @param cocktailId Meal id.
    * @param body Updated cocktail review.
    * @returns 
    */
   async updateCocktailReview(userId: string, cocktailId: string, body: {
      rating?: number,
      review?: string
   }): Promise<CocktailReview> {
      const repository = getRepository(CocktailReview)
      const cocktailReview = await repository.findOne({ where: { userId, cocktailId } })
      if (!cocktailReview) throw ApiError.NotFound('Cocktail review not found')
      if (body.rating) {
         if (body.rating < 0 || body.rating > 5) throw ApiError.BadRequest('Invalid rating')
         cocktailReview.rating = body.rating
      }
      if (body.review) cocktailReview.review = body.review
      const updated = await repository.save(cocktailReview)

      return updated
   },

   /**
    * Removes cocktail review.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @returns Removed cocktail review.
    */
   async removeCocktailReview(userId: string, cocktailId: string): Promise<CocktailReview> {
         const repository = getRepository(CocktailReview)
         const cocktailReview = await repository.findOne({ where: { userId, cocktailId } })
         if (!cocktailReview) throw ApiError.NotFound('Cocktail review not found')
         await repository.remove(cocktailReview)

         return cocktailReview
   },

   /**
    * Finds cocktail review by user id and cocktail id.
    * 
    * @param userId User id.
    * @param cocktailId Meal id.
    * @returns Found cocktail review.
    */
   async findOneCocktailReview(userId: string, cocktailId: string): Promise<CocktailReview> {
      const repository = getRepository(CocktailReview)
      const review = await repository.findOne({ where: { userId, cocktailId } })
      if (!review) throw ApiError.NotFound('Cocktail review not found')

      return review
   },

   /**
    * Finds cocktail reviews that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found cocktail reviews.
    */
   async findCocktailReviews(searchBy?: { userId?: string, cocktailId?: string }, offset = 0, limit = 0): Promise<CocktailReview[]> {
      const repository = getRepository(CocktailReview)
      const reviews = await repository.find({
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })
      if (!reviews || !reviews.length) throw ApiError.NotFound('No cocktail reviews were found')

      return reviews
   }
}
