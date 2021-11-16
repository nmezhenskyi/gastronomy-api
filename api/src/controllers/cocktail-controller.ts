import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { CocktailService } from '../services/cocktail-service'
import { paramToInt } from '../common/utils'
import { GetCocktailsQuery } from './utils/cocktail-utils'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles operations on `cocktails` resource.
 */
export const CocktailController = {
   /**
    * Find all cocktails.
    */
   async getAll(req: Request<unknown, unknown, unknown, GetCocktailsQuery>, res: Response, next: NextFunction) {
      try {
         const offset = paramToInt(req.query.offset)
         const limit = paramToInt(req.query.limit)

         const cocktails = await CocktailService.find({}, offset, limit)

         return res.status(200).json(cocktails)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find one cocktail by id.
    */
   async getById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Cocktail id is missing in the request URI')
         }

         const cocktail = await CocktailService.findOne({ id: req.params.id })

         return res.status(200).json(cocktail)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Create new cocktail.
    */
   async create(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         const cocktail = await CocktailService.create({
            name: req.body.name,
            description: req.body.description,
            method: req.body.method,
            notesOnIngredients: req.body.notesOnIngredients,
            notesOnExecution: req.body.notesOnExecution,
            notesOnTaste: req.body.notesOnTaste
         })

         return res.status(201).json(cocktail)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Update one cocktail by id.
    */
   async updateById(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }
         
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Cocktail id is missing in the request URI')
         }

         const cocktail = await CocktailService.update({
            id: req.params.id,
            name: req.body.name,
            description: req.body.description,
            method: req.body.method,
            notesOnIngredients: req.body.notesOnIngredients,
            notesOnExecution: req.body.notesOnExecution,
            notesOnTaste: req.body.notesOnTaste
         })

         return res.status(200).json(cocktail)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Add ingredient to cocktail.
    * 
    * Requires `ingredientId` or `category` and `name` in the request body.
    */
   async addIngredient(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body', errors.array())
         }

         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Cocktail id is missing in the request URI')
         }

         let result
         if (req.body.ingredientId) {
            result = await CocktailService.addIngredient(req.params.id, req.body.ingredientId, req.body.amount)
         }
         else if (req.body.category && req.body.name) {
            result = await CocktailService.addIngredient(req.params.id, {
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
    * Remove ingredient from cocktail.
    * 
    * Requires `id` (cocktail id) and `ingredientId` in the request params.
    */
   async removeIngredient(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Cocktail id is missing in the request URI')
         }
         if (!req.params || !req.params.ingredientId) {
            throw ApiError.BadRequest('Ingredient id is missing in the request URI')
         }

         const result = await CocktailService.removeIngredient(req.params.id, req.params.ingredientId)

         return res.status(200).json({ message: `Ingredient ${result.ingredientId} has been removed from the cocktail` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete one cocktail by id.
    */
   async deleteById(req: Request, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Cocktail id is missing in the request URI')
         }

         const cocktail = await CocktailService.remove(req.params.id)

         return res.status(200).json({ message: `Cocktail ${cocktail.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   }
}
