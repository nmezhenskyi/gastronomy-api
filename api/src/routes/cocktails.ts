import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { ReviewService } from '../services/review-service'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Role } from '../common/types'
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
router.get('/:id/reviews', async (req, res) => {
   const foundReviews = await ReviewService.findCocktailReviews({ cocktailId: req.params.id })
   if (foundReviews.message === 'NOT_FOUND') return res.status(404).json({ message: 'No cocktail reviews were found' })
   if (foundReviews.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find cocktail reviews' })

   return res.status(200).json(foundReviews.body)
})

/**
 * Write cocktail review as User.
 * 
 * @route   POST /cocktails/:id/reviews
 * @access  Private (User)
 */
router.post('/:id/reviews', authorize(Role.USER),
body('rating').notEmpty().isInt({ min: 0, max: 5 }),
body('review').notEmpty().isLength({ max: 2000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const savedReview = await ReviewService.createCocktailReview(req.user!.id, req.params.id, {
      rating: req.body.rating,
      review: req.body.review
   })
   if (savedReview.message === 'INVALID') return res.status(400).json({ message: 'Invalid data in the request body' })
   if (savedReview.message === 'NOT_FOUND') return res.status(404).json({ message: 'Cocktail and/or user account not found' })
   if (savedReview.message === 'FAILED') return res.status(500).json({ message: 'Server failed to create cocktail review' })

   return res.status(200).json(savedReview.body)
})

/**
 * Update cocktail review as User.
 * 
 * @route   PUT /cocktails/:id/reviews
 * @access  Private (User)
 */
router.put('/:id/reviews', authorize(Role.USER),
body('rating').optional().isInt({ min: 0, max: 5 }),
body('review').optional().isLength({ max: 2000 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const updatedReview = await ReviewService.updateCocktailReview(req.user!.id, req.params.id, {
      rating: req.body.rating,
      review: req.body.review
   })
   if (updatedReview.message === 'INVALID') return res.status(400).json({ message: 'Invalid data in the request body' })
   if (updatedReview.message === 'NOT_FOUND') return res.status(404).json({ message: 'Cocktail and/or user account not found' })
   if (updatedReview.message === 'FAILED') return res.status(500).json({ message: 'Server failed to update cocktail review' })

   return res.status(200).json(updatedReview.body)
})
