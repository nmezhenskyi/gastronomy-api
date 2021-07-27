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
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const result = await UserService.register({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
   })

   if (result.message === 'INVALID') return res.status(400).json({ message: 'Error: User with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Server Error: Couldn't create user account` })

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

   if (result.message === 'INVALID') return res.status(400).json({ message: 'Error: User with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Server Error: Couldn't log in account` })

   res.cookie('userRefreshToken', result.body.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })
   return res.status(200).json(result.body)
})

// router.get('/logout', async (req, res) => {
//    const result = await UserService.logout()
// })

/**
 * Find user's information.
 * 
 * @route   GET /user/profile
 * @access  Private (User)
 */
 router.get('/', authorize([Role.USER]), async (req: AuthRequest, res: Response) => {
   if (!req.user) return res.status(404).json({ message: 'Error: User not found' })

   const result = await UserService.findOne({ id: req.user.id })

   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Error: User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Server Error: Query failed' })
   
   return res.status(200).json(result.body)
})

export default router
