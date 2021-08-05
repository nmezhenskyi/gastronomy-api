import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { MemberService } from '../services/member-service'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Role } from '../common/types'

const router = express.Router()

/**
 * Register new member Creator account.
 * 
 * @route   POST /member/register
 * @access  Private (Supervisor)
 */
router.post('/',
authorize(Role.SUPERVISOR),
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
body('firstName').notEmpty().isLength({ max: 50 }),
body('lastName').notEmpty().isLength({ max: 50 }),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data', errors: errors.array() })

   const result = await MemberService.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: 'Creator'
   })

   if (result.message === 'INVALID') return res.status(400).json({ message: 'Member with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Couldn't create member account` })

   return res.status(200).json(result.body)
})

/**
 * Log in as a member.
 * 
 * @route   POST /member/login
 * @access  Public
 */
router.post('/login',
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
async (req, res) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Error: Invalid data', errors: errors.array() })

   const result = await MemberService.login(req.body.email, req.body.password)

   if (result.message === 'NOT_FOUND') return res.status(400).json({ message: `Wrong credentials` })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Couldn't log in` })

   return res.status(200).json(result.body)
})



export default router
