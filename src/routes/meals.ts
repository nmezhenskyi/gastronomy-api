import express, { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { MealService } from '../services/meal-service'
import { paramToInt } from '../common/utils'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Pagination, Role } from '../common/types'

const router = express.Router()

interface GetMealsQuery extends Pagination {
   name?: string
   cuisine?: string
}

/**
 * Find meals.
 * 
 * @route   GET /meals
 * @access  Public
 */
router.get('/', async (req: Request<unknown, unknown, unknown, GetMealsQuery>, res) => {
   const { name, cuisine, offset, limit } = req.query

   const searchBy: { name?: string, cuisine?: string } = {}
   if (name) searchBy.name = name
   if (cuisine) searchBy.cuisine = cuisine

   const result = await MealService.find(searchBy, paramToInt(offset), paramToInt(limit))

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Nothing found' })

   return res.status(200).json(result.body)
})

/**
 * Find meal by id.
 * 
 * @route   GET /meals/:id
 * @access  Public
 */
router.get('/:id', async (req, res) => {
   const result = await MealService.findOne({ id: req.params.id })

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Query failed' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal not found' })

   return res.status(200).json(result.body)
})

/**
 * Create new meal.
 * 
 * @route   POST /meals
 * @access  Private (Creator, Supervisor)
 */
router.post('/', authorize([Role.CREATOR, Role.SUPERVISOR]),
body('name').notEmpty().isLength({ max: 100 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('cuisine').isLength({ max: 20 }).trim(),
body('instructions').notEmpty().isLength({ max: 10000 }).trim(),
body('notesOnIngredients').isLength({ max: 2000 }).trim(),
body('notesOnExecution').isLength({ max: 2000 }).trim(),
body('notesOnTaste').isLength({ max: 1000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await MealService.create({
      name: req.body.name,
      description: req.body.description,
      cuisine: req.body.cuisine,
      instructions: req.body.instructions,
      notesOnIngredients: req.body.notesOnIngredients,
      notesOnExecution: req.body.notesOnExecution,
      notesOnTaste: req.body.notesOnTaste
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't create meal` })

   return res.status(200).json(result.body)
})

/**
 * Update meal by id.
 * 
 * @route   PUT /meals/:id
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id', authorize([Role.CREATOR, Role.SUPERVISOR]),
body('name').isLength({ max: 100 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('cuisine').isLength({ max: 20 }).trim(),
body('instructions').isLength({ max: 10000 }).trim(),
body('notesOnIngredients').isLength({ max: 2000 }).trim(),
body('notesOnExecution').isLength({ max: 2000 }).trim(),
body('notesOnTaste').isLength({ max: 1000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Meal id is missing in the request URI' })

   const result = await MealService.update({
      id: req.params.id,
      name: req.body.name,
      description: req.body.description,
      cuisine: req.body.cuisine,
      instructions: req.body.instructions,
      notesOnIngredients: req.body.notesOnIngredients,
      notesOnExecution: req.body.notesOnExecution,
      notesOnTaste: req.body.notesOnTaste
   })

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't update the meal` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal not found' })

   return res.status(200).json(result)
})

/**
 * Add ingredient to meal.
 * 
 * @route   PUT /meals/:id/ingredients
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id/ingredients', authorize([Role.CREATOR, Role.SUPERVISOR]),
body('ingredientId').isLength({ max: 36 }),
body('category').isLength({ max: 150 }).trim(),
body('name').isLength({ max: 150 }).trim(),
body('description').isLength({ max: 5000 }).trim(),
body('amount').notEmpty().isLength({ max: 20 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   if (!req.params || !req.params.id) return res.status(400).json({ message: 'Meal id is missing in the request URI' })

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
      return res.status(400).json({ message: 'Ingredient id or category and name are missing in the request body' })
   }

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't add ingredient to meal` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal and/or ingredient not found' })

   return res.status(200).json(result.body)
})

/**
 * Remove ingredient from meal.
 * 
 * @route   DELETE /meals/:id/ingredients/:ingredientId
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id/ingredients/:ingredientId', authorize([Role.CREATOR, Role.SUPERVISOR]),
async (req: AuthRequest, res: Response) => {
   const result = await MealService.removeIngredient(req.params.id, req.params.ingredientId)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't remove ingredient from meal` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal and/or ingredient not found' })

   return res.status(200).json({ message: 'Ingredient has been removed from meal' })
})

/**
 * Delete meal by id.
 * 
 * @route   DELETE /meals/:id
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id', authorize([Role.CREATOR, Role.SUPERVISOR]),
async (req: AuthRequest, res: Response) => {
   const result = await MealService.remove(req.params.id)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't delete meal` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal not found' })

   return res.status(200).json({ message: 'Meal has been deleted' })
})

export default router
