import express from 'express'
import { body } from 'express-validator'
import { authorize } from '../middleware/authorize'
import { Role } from '../common/types'
import { CocktailController } from '../controllers/cocktail-controller'

export const router = express.Router()

/**
 * Get all cocktails.
 * 
 * @route   GET /cocktails
 * @access  Public
 */
router.get('/', CocktailController.getAll)

/**
 * Get one cocktail by id.
 * 
 * @route   GET /cocktails/:id
 * @access  Public
 */
router.get('/:id', CocktailController.getById)

/**
 * Create new cocktail.
 * 
 * @route   POST /cocktails
 * @access  Private (Creator, Supervisor)
 */
router.post('/',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('name').notEmpty().isLength({ max: 100 }).trim(),
   body('description').optional().isLength({ max: 5000 }).trim(),
   body('method').notEmpty().isLength({ max: 3000 }).trim(),
   body('notesOnIngredients').optional().isLength({ max: 2000 }).trim(),
   body('notesOnExecution').optional().isLength({ max: 2000 }).trim(),
   body('notesOnTaste').optional().isLength({ max: 1000 }).trim(),
   CocktailController.create)

/**
 * Update cocktail by id.
 * 
 * @route   PUT /cocktails/:id
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('name').optional().isLength({ max: 100 }).trim(),
   body('description').optional().isLength({ max: 5000 }).trim(),
   body('method').optional().isLength({ max: 3000 }).trim(),
   body('notesOnIngredients').optional().isLength({ max: 2000 }).trim(),
   body('notesOnExecution').optional().isLength({ max: 2000 }).trim(),
   body('notesOnTaste').optional().isLength({ max: 1000 }).trim(),
   CocktailController.updateById)

/**
 * Add ingredient to cocktail.
 * 
 * @route   PUT /cocktails/:id/ingredients
 * @access  Private (Creator, Supervisor)
 */
router.put('/:id/ingredients',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('ingredientId').isLength({ max: 36 }),
   body('category').isLength({ max: 150 }).trim(),
   body('name').isLength({ max: 150 }).trim(),
   body('description').isLength({ max: 5000 }).trim(),
   body('amount').notEmpty().isLength({ max: 20 }).trim(),
   CocktailController.addIngredient)

/**
 * Remove ingredient from cocktail.
 * 
 * @route   DELETE /cocktails/:id/ingredients/:ingredientId
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id/ingredients/:ingredientId',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   CocktailController.removeIngredient)

/**
 * Delete cocktail by id.
 * 
 * @route   DELETE /cocktails/:id
 * @access  Private (Creator, Supervisor)
 */
router.delete('/:id',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   CocktailController.deleteById)

/**
 * Find cocktail reviews.
 * 
 * @route   GET /cocktails/:id/reviews
 * @access  Public
 */
router.get('/:id/reviews', CocktailController.findReviews)

/**
 * Write cocktail review as User.
 * 
 * @route   POST /cocktails/:id/reviews
 * @access  Private (User)
 */
router.post('/:id/reviews',
   authorize(Role.USER),
   body('rating').notEmpty().isInt({ min: 0, max: 5 }),
   body('review').notEmpty().isLength({ max: 2000 }).trim(),
   CocktailController.writeReview)

/**
 * Update cocktail review as User.
 * 
 * @route   PUT /cocktails/:id/reviews
 * @access  Private (User)
 */
router.put('/:id/reviews',
   authorize(Role.USER),
   body('rating').optional().isInt({ min: 0, max: 5 }),
   body('review').optional().isLength({ max: 2000 }).trim(),
   CocktailController.updateReview)
