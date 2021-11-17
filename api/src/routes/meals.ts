import express from 'express'
import { body } from 'express-validator'
import { authorize } from '../middleware/authorize'
import { Role } from '../common/types'
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
router.get('/:id/reviews', MealController.findReviews)

/**
 * Write meal review as User.
 * 
 * @route   POST /meals/:id/reviews
 * @access  Private (User)
 */
router.post('/:id/reviews',
   authorize(Role.USER),
   body('rating').notEmpty().isInt({ min: 0, max: 5 }),
   body('review').notEmpty().isLength({ max: 2000 }).trim(),
   MealController.writeReview)

/**
 * Update meal review as User.
 * 
 * @route   PUT /meals/:id/reviews
 * @access  Private (User)
 */
router.put('/:id/reviews',
   authorize(Role.USER),
   body('rating').optional().isInt({ min: 0, max: 5 }),
   body('review').optional().isLength({ max: 2000 }).trim(),
   MealController.updateReview)
