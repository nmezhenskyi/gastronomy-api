import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { UserService } from '../services/user-service'
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
      return res.status(400).json({ message: 'Invalid data', errors: errors.array() })

   const result = await UserService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
   })

   if (result.message === 'INVALID') return res.status(400).json({ message: 'User with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Couldn't create user account` })

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
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const result = await UserService.login(req.body.email, req.body.password)

   if (result.message === 'NOT_FOUND') return res.status(400).json({ message: `Wrong credentials` })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Couldn't log in` })

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
   if (!req.user) return res.status(404).json({ message: 'User not found' })

   const result = await UserService.findOne({ id: req.user.id })

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Query failed' })
   
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
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   if (!req.user) return res.status(404).json({ message: 'User not found' })

   const result = await UserService.update({
      id: req.user.id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      location: req.body.location,
      photo: req.body.photo
   })

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't update user profile` })

   return res.status(200).json(result.body)
})

/**
 * Delete user account.
 * 
 * @route   DELETE /user/profile
 * @access  Private (User)
 */
router.delete('/profile', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   if (!req.user) return res.status(404).json({ message: 'User not found' })

   const result = await UserService.remove(req.user.id)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Couldn't delete user account` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })

   return res.status(200).json({ message: 'User has been deleted' })
})

/**
 * Get user's saved cocktails.
 * 
 * @route   GET /user/saved/cocktails
 * @access  Private (User)
 */
router.get('/saved/cocktails', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   if (!req.user) return res.status(404).json({ message: 'User not found' })

   const result = await UserService.findSavedCocktails(req.user.id)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Failed` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Not found' })

   return res.status(200).json(result.body)
})

/**
 * Add cockctail to the list of saved cocktails.
 * 
 * @route   PUT /user/saved/cocktails
 * @access  Private (User)
 */
router.post('/saved/cocktails',
authorize(Role.USER),
body('cocktailId').notEmpty().trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   if (!req.user) return res.status(404).json({ message: 'User not found' })

   const result = await UserService.saveCocktail(req.user.id, req.body.cocktailId)

   if (result.message === 'FAILED') return res.status(500).json({ message: `Failed` })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Not found' })

   return res.status(200).json(result.body)
})

/**
 * Remove cocktail from the list of saved cocktails.
 * 
 * @route   DELETE /user/saved/cocktails/:cocktailId
 * @access  Private (User)
 */
router.delete('/saved/cocktails/:cocktailId', authorize(Role.USER), async (req: AuthRequest, res: Response) => {
   if (!req.user) return res.status(404).json({ message: 'User not found' })
   if (!req.params.cocktailId) return res.status(404).json({ message: 'Cocktail not found' })

   const result = await UserService.removeCocktail(req.user.id, req.params.cocktailId)

   if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to remove cocktail' })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Cocktail not found' })

   return res.status(200).json({ message: 'Cocktail has been removed from saved cocktails' })
})

export default router
