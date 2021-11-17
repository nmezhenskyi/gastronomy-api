import express from 'express'
import { body } from 'express-validator'
import { authorize } from '../middleware/authorize'
import { Role } from '../common/types'
import { UserController } from '../controllers/user-controller'

export const router = express.Router()

/**
 * Register new user account.
 * 
 * @route   POST /user/register
 * @access  Public
 */
router.post('/register',
   body('name').notEmpty().isLength({ max: 255 }).trim(),
   body('email').notEmpty().isEmail(),
   body('password').notEmpty().isLength({ min: 6, max: 50 }),
   UserController.register)

/**
 * Log in as a user.
 * 
 * @route   POST /user/login
 * @access  Public
 */
router.post('/login',
   body('email').notEmpty().isEmail(),
   body('password').notEmpty().isLength({ min: 6, max: 50 }),
   UserController.login)

/**
 * Log out as a user.
 * 
 * @route   GET /user/logout
 * @access  Public
 */
router.get('/logout', UserController.logout)

/**
 * Use refresh token to get a new pair of access and refresh tokens.
 * 
 * @route   GET /user/refresh
 * @access  Public
 */
router.get('/refresh', UserController.refreshAccess)

/**
 * Find user's information.
 * 
 * @route   GET /user/profile
 * @access  Private (User)
 */
 router.get('/profile',
   authorize(Role.USER),
   UserController.getSelf)

/**
 * Update user information.
 * 
 * @route   PUT /user/profile
 * @access  Private (User)
 */
router.put('/profile',
   authorize(Role.USER),
   UserController.updateSelf)

/**
 * Delete user account.
 * 
 * @route   DELETE /user/profile
 * @access  Private (User)
 */
router.delete('/profile',
   authorize(Role.USER),
   UserController.deleteSelf)

/**
 * Find user's saved cocktails.
 * 
 * @route   GET /user/saved/cocktails
 * @access  Private (User)
 */
router.get('/saved/cocktails',
   authorize(Role.USER),
   UserController.getSavedCocktails)

/**
 * Add cocktail to the list of saved cocktails.
 * 
 * @route   PUT /user/saved/cocktails
 * @access  Private (User)
 */
router.put('/saved/cocktails',
   authorize(Role.USER),
   body('cocktailId').isLength({ min: 0, max: 255 }).trim(),
   UserController.saveMeal)

/**
 * Remove cocktail from the list of saved cocktails.
 * 
 * @route   DELETE /user/saved/cocktails/:cocktailId
 * @access  Private (User)
 */
router.delete('/saved/cocktails/:cocktailId',
   authorize(Role.USER),
   UserController.unsaveCocktail)

/**
 * Find user's saved meals.
 * 
 * @route   GET /user/saved/meals
 * @access  Private (User)
 */
router.get('/saved/meals',
   authorize(Role.USER),
   UserController.getSavedMeals)

/**
 * Add meal to the list of saved meals.
 * 
 * @route   PUT /user/saved/cocktails
 * @access  Private (User)
 */
router.put('/saved/meals',
   authorize(Role.USER),
   body('mealId').isLength({ min: 0, max: 255 }).trim(),
   UserController.saveMeal)

/**
 * Remove meal from the list of saved meals.
 * 
 * @route   DELETE /user/saved/meals/:mealId
 * @access  Private (User)
 */
router.delete('/saved/meals/:mealId',
   authorize(Role.USER),
   UserController.unsaveMeal)

/**
 * Find user's cocktail reviews.
 * 
 * @route   GET /user/cocktail-reviews
 * @access  Private(User)
 */
router.get('/cocktail-reviews',
   authorize(Role.USER),
   UserController.getCocktailReviews)

/**
 * Find user's meal reviews.
 * 
 * @route   GET /user/meal-reviews
 * @access  Private (User)
 */
router.get('/meal-reviews',
   authorize(Role.USER),
   UserController.getMealReviews)
