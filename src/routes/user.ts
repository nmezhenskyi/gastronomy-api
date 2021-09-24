import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { UserService } from '../services/user-service'
import { ReviewService } from '../services/review-service'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Role } from '../common/types'

const router = express.Router()

/**
 * Register new user account.
 * 
 * @route   POST /user/register
 * @access  Public
 */
router.post('/',
body('name').notEmpty().isLength({ max: 255 }).trim(),
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await UserService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
   })
   if (result.message === 'INVALID') return res.status(400).json({ message: 'User with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: 'Server failed to create user account' })

   res.cookie('userRefreshToken', result.body.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })
   return res.status(200).json(result.body)
})

/**
 * Log in as a user.
 * 
 * @route   POST /user/login
 * @access  Public
 */
router.post('/login',
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await UserService.login(req.body.email, req.body.password)
   if (result.message === 'NOT_FOUND') return res.status(400).json({ message: 'Wrong credentials' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: 'Server failed to process log in' })

   res.cookie('userRefreshToken', result.body.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })
   return res.status(200).json(result.body)
})

/**
 * Log out as a user.
 * 
 * @route   GET /user/logout
 * @access  Public
 */
router.get('/logout', async (req, res) => {
   if (!req.cookies?.userRefreshToken) return res.status(400).send()

   const { userRefreshToken } = req.cookies
   await UserService.logout(userRefreshToken)
   res.clearCookie('userRefreshToken')

   return res.status(200).send()
})

/**
 * Use refresh token to get a new pair of access and refresh tokens.
 * 
 * @route   GET /user/refresh
 * @access  Public
 */
router.get('/refresh', async (req, res) => {
   if (!req.cookies?.userRefreshToken) return res.status(400).json({ message: 'Refresh token is missing' })

   const { userRefreshToken } = req.cookies
   const result = await UserService.refresh(userRefreshToken)
   if (result.message === 'FAILED' || !result.body) return res.status(401).json({ message: 'Not authorized' })

   res.cookie('userRefreshToken', result.body.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })
   return res.status(200).json(result.body)
})

/**
 * Find user's information.
 * 
 * @route   GET /user/profile
 * @access  Private (User)
 */
 router.get('/profile', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await UserService.findOne({ id: req.user!.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to retrieve user account' })
   
   return res.status(200).json(result.body)
})

/**
 * Update user information.
 * 
 * @route   PUT /user/profile
 * @access  Private (User)
 */
router.put('/profile',
authorize(Role.USER),
body('name').optional().isLength({ max: 255 }).trim(),
body('email').optional().isEmail(),
body('password').optional().isLength({ min: 6, max: 50 }),
body('location').optional().isLength({ max: 100 }),
body('photo').optional().isLength({ max: 255 }),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await UserService.update({
      id: req.user!.id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      location: req.body.location,
      photo: req.body.photo
   })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to update user account' })

   return res.status(200).json(result.body)
})

/**
 * Delete user account.
 * 
 * @route   DELETE /user/profile
 * @access  Private (User)
 */
router.delete('/profile', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await UserService.remove(req.user!.id)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to delete user account' })

   return res.status(200).json({ message: 'User has been deleted' })
})

/**
 * Find user's saved cocktails.
 * 
 * @route   GET /user/saved/cocktails
 * @access  Private (User)
 */
router.get('/saved/cocktails', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await UserService.findSavedCocktails(req.user!.id)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No saved cocktails were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find saved cocktails' })

   return res.status(200).json(result.body)
})

/**
 * Add cocktail to the list of saved cocktails.
 * 
 * @route   PUT /user/saved/cocktails
 * @access  Private (User)
 */
router.put('/saved/cocktails',
authorize(Role.USER),
body('cocktailId').isLength({ min: 0, max: 255 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await UserService.saveCocktail(req.user!.id, req.body.cocktailId)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Cocktail and/or user not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to save cocktail' })

   return res.status(200).json(result.body)
})

/**
 * Remove cocktail from the list of saved cocktails.
 * 
 * @route   DELETE /user/saved/cocktails/:cocktailId
 * @access  Private (User)
 */
router.delete('/saved/cocktails/:cocktailId', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   if (!req.params.cocktailId) return res.status(404).json({ message: 'Cocktail not found' })

   const result = await UserService.removeSavedCocktail(req.user!.id, req.params.cocktailId)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to remove saved cocktail' })

   return res.status(200).json({ message: 'Cocktail has been removed from saved cocktails' })
})

/**
 * Find user's saved meals.
 * 
 * @route   GET /user/saved/meals
 * @access  Private (User)
 */
router.get('/saved/meals', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await UserService.findSavedMeals(req.user!.id)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No saved meals were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find saved meals' })

   return res.status(200).json(result.body)
})

/**
 * Add meal to the list of saved meals.
 * 
 * @route   PUT /user/saved/cocktails
 * @access  Private (User)
 */
router.put('/saved/meals', authorize(Role.USER),
body('mealId').isLength({ min: 0, max: 255 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await UserService.saveMeal(req.user!.id, req.body.mealId)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Meal and/or user not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to save meal' })

   return res.status(200).json(result.body)
})

/**
 * Remove meal from the list of saved meals.
 * 
 * @route   DELETE /user/saved/meals/:mealId
 * @access  Private (User)
 */
router.delete('/saved/meals/:mealId', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   if (!req.params.mealId) return res.status(404).json({ message: 'Meal not found' })

   const result = await UserService.removeSavedMeal(req.user!.id, req.params.mealId)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to remove saved meal' })

   return res.status(200).json({ message: 'Meal has been removed from saved meals' })
})

/**
 * Find user's cocktail reviews.
 * 
 * @route   GET /user/cocktail-reviews
 * @access  Private(User)
 */
 router.get('/cocktail-reviews', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await ReviewService.findCocktailReviews({ userId: req.user!.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No cocktail reviews were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find cocktail reviews' })

   return res.status(200).json(result.body)
})

/**
 * Find user's meal reviews.
 * 
 * @route   GET /user/meal-reviews
 * @access  Private (User)
 */
router.get('/meal-reviews', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   const result = await ReviewService.findMealReviews({ userId: req.user!.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No meal reviews were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server failed to find meal reviews' })

   return res.status(200).json(result.body)
})

export default router
