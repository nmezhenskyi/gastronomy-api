import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { IngredientService } from '../services/ingredient-service'
import { Pagination } from '../common/types'
import { paramToInt } from '../common/utils'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles operations on `ingredients` resource.
 */
export const IngredientController = {
   /**
    * Find all ingredients.
    */
   async getAll(req: Request<unknown, unknown, unknown, Pagination>, res: Response, next: NextFunction) {
      try {
         const offset = paramToInt(req.query.offset)
         const limit = paramToInt(req.query.limit)

         const ingredients = await IngredientService.find({}, offset, limit)

         return res.status(200).json(ingredients)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find one ingredient by id.
    */
   async getById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Ingredient id is missing in the request URI')
         }

         const ingredient = await IngredientService.findOne({ id: req.params.id })

         return res.status(200).json(ingredient)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Create new ingredient.
    */
   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }
          
         const ingredient = await IngredientService.create({
            category: req.body.category,
            name: req.body.name,
            description: req.body.description
         })

         return res.status(201).json(ingredient)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Update one ingredient by id.
    */
   async updateById(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Ingredient id is missing in the request URI')
         }

         const ingredient = await IngredientService.update({
            id: req.params.id,
            category: req.body.category,
            name: req.body.name,
            description: req.body.description
         })

         return res.status(200).json(ingredient)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete one ingredient by id.
    */
   async deleteById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Ingredient id is missing in the request URI')
         }

         const ingredient = await IngredientService.remove(req.params.id)

         return res.status(200).json({ message: `Ingredient ${ingredient.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   }
}
