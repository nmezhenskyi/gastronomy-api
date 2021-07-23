import express from 'express'
import { body, validationResult } from 'express-validator'
import { UserService } from '../services/user-service'
import { TokenService } from '../services/token-service'
import { authenticateUser } from '../middleware/authenticate-user'

const router = express.Router()

/**
 * Registers new user account.
 * 
 * @route   POST /users
 * @access  Public
 */
router.post('/',
body('name').notEmpty().isLength({ max: 255 }).trim(),
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const result = await UserService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
   })

   if (result.message === 'INVALID_DATA') return res.status(400).json({ message: 'Error: User with this email already exists' })
   if (result.message === 'FAILED') return res.status(500).json({ message: `Server Error: Couldn't create user account` })

   return res.status(200).json(result.body)
})

/**
 * Finds user accounts.
 * 
 * @route   GET /users
 * @access  Private
 */
router.get('/', authenticateUser, async (_, res) => {
   const result = await UserService.find()

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: Nothing found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server Error: Query failed' })
   
   return res.status(200).json(result.body)
})

// Authentication:

/**
 * Log in as a user.
 * 
 * @route   POST /users/login
 * @access  Public
 */
router.post('/login',
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const user = await UserService.findByCredentials(req.body.email, req.body.password)

   if (user.message === 'NOT_FOUND')
      return res.status(404).json({ message: 'Error: Invalid Credentials' })
   if (user.message === 'FAILED' || !user.success || !user.body)
      return res.status(500).json({ message: `Server Error: Couldn't log in` })

   const payload = { user: { id: user.body.id } }
   const tokenPair = TokenService.generateTokens(payload)
   const refreshTokenData = await TokenService.saveRefreshToken(user.body.id, tokenPair.refreshToken)

   if (refreshTokenData.message === 'FAILED' || !refreshTokenData.body)
      return res.status(500).json({ message: `Server Error: Couldn't log in` })

   return res.status(200).json(tokenPair)
})

export default router
