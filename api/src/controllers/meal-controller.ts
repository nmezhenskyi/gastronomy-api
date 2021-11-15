import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { MealService } from '../services/meal-service'
import { paramToInt } from '../common/utils'
import { GetMealsQuery } from './utils/meal-utils'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles operations on `meals` resource.
 */
export const MealController = {
   /**
    * Find all meals.
    */
   async getAll(req: Request<unknown, unknown, unknown, GetMealsQuery>, res: Response, next: NextFunction) {
      try {
         const offset = paramToInt(req.query.offset)
         const limit = paramToInt(req.query.limit)

         const meals = await MealService.find({}, offset, limit)

         return res.status(200).json(meals)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find one meal by id.
    */
   async getById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Meal id is missing in the request URI')
         }

         const meal = await MealService.findOne({ id: req.params.id })

         return res.status(200).json(meal)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Create new meal.
    */
   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         const meal = await MealService.create({
            name: req.body.name,
            description: req.body.description,
            cuisine: req.body.cuisine,
            instructions: req.body.instructions,
            notesOnIngredients: req.body.notesOnIngredients,
            notesOnExecution: req.body.notesOnExecution,
            notesOnTaste: req.body.notesOnTaste
         })

         return res.status(201).json(meal)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Updated one meal by id.
    */
   async updateById(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Meal id is missing in the request URI')
         }

         const meal = await MealService.update({
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            cuisine: req.body.cuisine,
            instructions: req.body.instructions,
            notesOnIngredients: req.body.notesOnIngredients,
            notesOnExecution: req.body.notesOnExecution,
            notesOnTaste: req.body.notesOnTaste
         })

         return res.status(200).json(meal)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Add ingredient to meal.
    * 
    * Requires `ingredientId` or `category` and `name` in the request body.
    */
   async addIngredient(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Meal id is missing in the request URI')
         }

         let result
         if (req.body.ingredientId) {
            result = await MealService.addIngredient(req.params.id, req.body.ingredientId, req.body.amount)
         }
         else if (req.body.category && req.body.name) {
            result = await MealService.addIngredient(req.params.id, {
               category: req.body.category,
               name: req.body.name,
               description: req.body.description
            }, req.body.amount)
         }
         else {
            throw ApiError.BadRequest('Ingredient id or category and name are missing in the request body')
         }

         return res.status(200).json(result)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Remove ingredient from meal.
    * 
    * Requires `id` (meal id) and `ingredientId` in the request params.
    */
   async removeIngredient(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Meal id is missing in the request URI')
         }
         if (!req.params || !req.params.ingredientId) {
            throw ApiError.BadRequest('Ingredient id is missing in the request URI')
         }

         const result = await MealService.removeIngredient(req.params.id, req.params.ingredientId)

         return res.status(200).json({ message: `Ingredient ${result.ingredientId} has been removed from the meal` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete one meal by id.
    */
   async deleteById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Meal id is missing in the request URI')
         }

         const meal = await MealService.remove(req.params.id)

         return res.status(200).json({ message: `Meal ${meal.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   }
}
