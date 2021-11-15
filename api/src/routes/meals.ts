import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { ReviewService } from '../services/review-service'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Role } from '../common/types'
import { MealController } from '../controllers/meal-controller'

export const router = express.Router()
/**
 * Find meals.
 * 
 * @route   GET /meals
 * @access  Public
 */
router.get('/', MealController.getAll)

/**
 * Find meal by id.
 * 
 * @route   GET /meals/:id
 * @access  Public
 */
router.get('/:id', MealController.getById)

/**
 * Create new meal.
 * 
 * @route   POST /meals
 * @access  Private (Creator, Supervisor)
 */
router.post('/',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('name').notEmpty().isLength({ max: 100 }).trim(),
   body('description').optional().isLength({ max: 5000 }).trim(),
   body('cuisine').optional().isLength({ max: 20 }).trim(),
   body('instructions').notEmpty().isLength({ max: 10000 }).trim(),
   body('notesOnIngredients').optional().isLength({ max: 2000 }).trim(),
   body('notesOnExecution').optional().isLength({ max: 2000 }).trim(),
   body('notesOnTaste').optional().isLength({ max: 1000 }).trim(),
   MealController.create)

/**
 * Update meal by id.
 * 
 * @route   PUT /meals/:id
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('name').optional().isLength({ max: 100 }).trim(),
   body('description').optional().isLength({ max: 5000 }).trim(),
   body('cuisine').optional().isLength({ max: 20 }).trim(),
   body('instructions').optional().isLength({ max: 10000 }).trim(),
   body('notesOnIngredients').optional().isLength({ max: 2000 }).trim(),
   body('notesOnExecution').optional().isLength({ max: 2000 }).trim(),
   body('notesOnTaste').optional().isLength({ max: 1000 }).trim(),
   MealController.updateById)

/**
 * Add ingredient to meal.
 * 
 * @route   PUT /meals/:id/ingredients
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id/ingredients',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('ingredientId').isLength({ max: 36 }),
   body('category').isLength({ max: 150 }).trim(),
   body('name').isLength({ max: 150 }).trim(),
   body('description').isLength({ max: 5000 }).trim(),
   body('amount').notEmpty().isLength({ max: 20 }).trim(),
   MealController.addIngredient)

/**
 * Remove ingredient from meal.
 * 
 * @route   DELETE /meals/:id/ingredients/:ingredientId
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id/ingredients/:ingredientId',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   MealController.removeIngredient)

/**
 * Delete meal by id.
 * 
 * @route   DELETE /meals/:id
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   MealController.deleteById)

/**
 * Find meal reviews.
 * 
 * @route   GET /meals/:id/reviews
 * @access  Public
 */
router.get('/:id/reviews', async (req, res) => {
   const foundReviews = await ReviewService.findMealReviews({ mealId: req.params.id })
   if (foundReviews.message === 'NOT_FOUND') return res.status(404).json({ message: 'No mea; reviews were found' })
   if (foundReviews.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find meal reviews' })

   return res.status(200).json(foundReviews.body)
})

/**
 * Write meal review as User.
 * 
 * @route   POST /meals/:id/reviews
 * @access  Private (User)
 */
router.post('/:id/reviews', authorize(Role.USER),
body('rating').notEmpty().isInt({ min: 0, max: 5 }),
body('review').notEmpty().isLength({ max: 2000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const savedReview = await ReviewService.createMealReview(req.user!.id, req.params.id, {
      rating: req.body.rating,
      review: req.body.review
   })
   if (savedReview.message === 'INVALID') return res.status(400).json({ message: 'Invalid data in the request body' })
   if (savedReview.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal and/or user account not found' })
   if (savedReview.message === 'FAILED') return res.status(500).json({ message: 'Server failed to create meal review' })

   return res.status(200).json(savedReview.body)
})

/**
 * Update meal review as User.
 * 
 * @route   PUT /meals/:id/reviews
 * @access  Private (User)
 */
router.put('/:id/reviews', authorize(Role.USER),
body('rating').optional().isInt({ min: 0, max: 5 }),
body('review').optional().isLength({ max: 2000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const updatedReview = await ReviewService.updateMealReview(req.user!.id, req.params.id, {
      rating: req.body.rating,
      review: req.body.review
   })
   if (updatedReview.message === 'INVALID') return res.status(400).json({ message: 'Invalid data in the request body' })
   if (updatedReview.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal and/or user account not found' })
   if (updatedReview.message === 'FAILED') return res.status(500).json({ message: 'Server failed to update meal review' })

   return res.status(200).json(updatedReview.body)
})
