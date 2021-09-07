import { getRepository } from 'typeorm'
import { MealReview } from '../models/meal-review'
import { ServiceResponse } from './service-response'
import { MealService } from './meal-service'
import { UserService } from './user-service'
import { logger } from '../common/logger'

export const ReviewService = {
   /**
    * Saves meal review.
    * 
    * @param mealId Meal id
    * @param userId User id
    * @param body New review
    * @returns ServiceResponse object with created meal review
    */
    async createMealReview(userId: string, mealId: string, body: {
      rating: number,
      review: string
   }): Promise<ServiceResponse<MealReview>> {
      try {
         const meal = await MealService.findOne({ id: mealId })
         if (meal.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
         if (meal.message === 'FAILED' || !meal.body) return { success: false, message: 'FAILED' }

         const user = await UserService.findOne({ id: userId })
         if (user.message === 'NOT_FOUND') return { success: false, message: 'NOT_FOUND' }
         if (user.message === 'FAILED' || !user.body) return { success: false, message: 'FAILED' }

         if (body.rating < 0 || body.rating > 5) return { success: false, message: 'INVALID' }

         const repository = getRepository(MealReview)
         const mealReview = new MealReview()
         mealReview.meal = meal.body
         mealReview.user = user.body
         mealReview.rating = body.rating
         mealReview.review = body.review
         const saved = await repository.save(mealReview)

         return {
            success: true,
            message: 'CREATED',
            body: saved
         }
      }
      catch (err) {
         logger.error(`UserService.postMealReview(): ${err}`)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Updates meal review.
    * 
    * @param userId User id
    * @param mealId Meal id
    * @param body Updated review
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
      catch (err) {
         logger.error(`UserService.updateMealReview(): ${err}`)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Removes meal review.
    * 
    * @param userId User id
    * @param mealId Meal id
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
      catch (err) {
         logger.error(`UserService.removeMealReview(): ${err}`)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds meal review by user id and meal id.
    * 
    * @param userId User id
    * @param mealId Meal id
    * @returns ServiceResponse object with found meal review
    */
   async findMealReview(userId: string, mealId: string): Promise<ServiceResponse<MealReview>> {
      try {
         const repository = getRepository(MealReview)
         const mealReview = await repository.findOne({ where: { userId, mealId } })
         if (!mealReview) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: mealReview
         }
      }
      catch (err) {
         logger.error(`UserService.findMealReview(): ${err}`)
         return { success: false, message: 'FAILED' }
      }
   },

   /**
    * Finds meal reviews that match given conditions.
    * 
    * @param searchBy Search condition
    * @returns ServiceResponse object with array of found meal reviews
    */
   async findMealReviews(searchBy?: { userId?: string, mealId?: string }, offset = 0, limit = 0): Promise<ServiceResponse<MealReview[]>> {
      try {
         const repository = getRepository(MealReview)
         const mealReviews = await repository.find({
            where: searchBy,
            order: { createdAt: 'DESC' },
            skip: offset,
            take: limit
         })
         if (!mealReviews || mealReviews.length === 0) return { success: false, message: 'NOT_FOUND' }

         return {
            success: true,
            message: 'FOUND',
            body: mealReviews
         }
      }
      catch (err) {
         logger.error(`UserService.findMealReviews(): ${err}`)
         return { success: false, message: 'FAILED' }
      }
   }
}
