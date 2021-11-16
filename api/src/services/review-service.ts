import { getRepository } from 'typeorm'
import { MealReview } from '../models/meal-review'
import { CocktailReview } from '../models/cocktail-review'
import { ServiceResponse } from './utils/service-response'
import { MealService } from './meal-service'
import { CocktailService } from './cocktail-service'
import { UserService } from './user-service'

export const ReviewService = {
   /**
    * Saves meal review.
    * 
    * @param mealId Meal id.
    * @param userId User id.
    * @param body New meal review.
    * @returns ServiceResponse object with created meal review
    */
    async createMealReview(userId: string, mealId: string, body: {
      rating: number,
      review: string
   }): Promise<ServiceResponse<MealReview>> {
      const meal = await MealService.findOne({ id: mealId })

      const user = await UserService.findOne({ id: userId })

      if (body.rating < 0 || body.rating > 5) return { success: false, message: 'INVALID' }

      const repository = getRepository(MealReview)
      const mealReview = new MealReview()
      mealReview.meal = meal
      mealReview.user = user
      mealReview.rating = body.rating
      mealReview.review = body.review
      const saved = await repository.save(mealReview)

      return {
         success: true,
         message: 'CREATED',
         body: saved
      }
   },

   /**
    * Updates meal review.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @param body Updated meal review.
    * @returns ServiceResponse object with updated meal review
    */
   async updateMealReview(userId: string, mealId: string, body: {
      rating?: number,
      review?: string
   }): Promise<ServiceResponse<MealReview>> {
      try {
         const repository = getRepository(MealReview)
         const mealReview = await repository.findOne({ where: { userId, mealId } })
         if (!mealReview) return { success: false, message: 'NOT_FOUND' }

         if (body.rating) {
            if (body.rating < 0 || body.rating > 5) return { success: false, message: 'INVALID' }
            mealReview.rating = body.rating
         }
         if (body.review) mealReview.review = body.review

         const saved = await repository.save(mealReview)

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
    * Removes meal review.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns ServiceResponse object
    */
   async removeMealReview(userId: string, mealId: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(MealReview)
         const mealReview = await repository.findOne({ where: { userId, mealId } })
         if (!mealReview) return { success: false, message: 'NOT_FOUND' }

         await repository.remove(mealReview)

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
    * Finds meal review by user id and meal id.
    * 
    * @param userId User id.
    * @param mealId Meal id.
    * @returns ServiceResponse object with found meal review
    */
   async findMealReview(userId: string, mealId: string): Promise<ServiceResponse<MealReview>> {
      try {
         const repository = getRepository(MealReview)
         const found = await repository.findOne({ where: { userId, mealId } })
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
    * Finds meal reviews that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns ServiceResponse object with array of found meal reviews
    */
   async findMealReviews(searchBy?: { userId?: string, mealId?: string }, offset = 0, limit = 0): Promise<ServiceResponse<MealReview[]>> {
      try {
         const repository = getRepository(MealReview)
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
    * Saves cocktail review.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @param body New cocktail review.
    * @returns ServiceResponse object with created cocktail review
    */
   async createCocktailReview(userId: string, cocktailId: string, body: {
      rating: number,
      review: string
   }): Promise<ServiceResponse<CocktailReview>> {
      const cocktail = await CocktailService.findOne({ id: cocktailId })

      const user = await UserService.findOne({ id: userId })

      if (body.rating < 0 || body.rating > 5) return { success: false, message: 'INVALID' }

      const repository = getRepository(CocktailReview)
      const cocktailReview = new CocktailReview()
      cocktailReview.cocktail = cocktail
      cocktailReview.user = user
      cocktailReview.rating = body.rating
      cocktailReview.review = body.review
      const saved = await repository.save(cocktailReview)

      return {
         success: true,
         message: 'CREATED',
         body: saved
      }
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
   }): Promise<ServiceResponse<CocktailReview>> {
      try {
         const repository = getRepository(CocktailReview)
         const cocktailReview = await repository.findOne({ where: { userId, cocktailId } })
         if (!cocktailReview) return { success: false, message: 'NOT_FOUND' }

         if (body.rating) {
            if (body.rating < 0 || body.rating > 5) return { success: false, message: 'INVALID' }
            cocktailReview.rating = body.rating
         }
         if (body.review) cocktailReview.review = body.review

         const saved = await repository.save(cocktailReview)

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
    * Removes cocktail review.
    * 
    * @param userId User id.
    * @param cocktailId Cocktail id.
    * @returns ServiceResponse object
    */
   async removeCocktailReview(userId: string, cocktailId: string): Promise<ServiceResponse<null>> {
      try {
         const repository = getRepository(CocktailReview)
         const cocktailReview = await repository.findOne({ where: { userId, cocktailId } })
         if (!cocktailReview) return { success: false, message: 'NOT_FOUND' }

         await repository.remove(cocktailReview)

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
    * Finds cocktail review by user id and cocktail id.
    * 
    * @param userId User id.
    * @param cocktailId Meal id.
    * @returns ServiceResponse object with found cocktail review
    */
   async findCocktailReview(userId: string, cocktailId: string): Promise<ServiceResponse<CocktailReview>> {
      try {
         const repository = getRepository(CocktailReview)
         const found = await repository.findOne({ where: { userId, cocktailId } })
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
    * Finds cocktail reviews that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns ServiceResponse object with array of found cocktail reviews
    */
   async findCocktailReviews(searchBy?: { userId?: string, cocktailId?: string }, offset = 0, limit = 0): Promise<ServiceResponse<CocktailReview[]>> {
      try {
         const repository = getRepository(CocktailReview)
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
   }
}
