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
body('firstName').notEmpty().isLength({ max: 50 }).trim(),
body('lastName').notEmpty().isLength({ max: 50 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await MemberService.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: Role.CREATOR
   })

   if (result.message === 'INVALID') return res.status(400).json({ message: 'Member with this email already exists' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: 'Failed to create member account' })

   return res.status(200).json(result.body)
})

/**
 * Delete member account.
 * Supervisor can only delete Creator or itself.
 * 
 * @route   DELETE /member/:id
 * @access  Private (Supervisor)
 */
router.delete('/:id', authorize(Role.SUPERVISOR), async (req: AuthRequest, res: Response) => {
   if (req.member?.id === req.params.id) {
      const result = await MemberService.remove(req.params.id)
      if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Member account not found' })
      if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to delete member account due to unexpected error' })
      return res.status(200).json({ message: 'Member account has been deleted' })
   }

   const member = await MemberService.findOne({ id: req.params.id })
   if (member.message === 'NOT_FOUND') return res.status(404).json({ message: 'Member account not found' })
   if (member.message === 'FAILED' || !member.body) return res.status(500).json({ message: `Failed to delete member account due to unexpected error` })
   if (member.body.role.toString() === Role.SUPERVISOR) return res.status(403).json({ message: 'Forbidden' })

   const result = await MemberService.remove(req.params.id)
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Member account not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: `Failed to delete member account due to unexpected error` })
   return res.status(200).json({ message: 'Member account has been deleted' })
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
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const result = await MemberService.login(req.body.email, req.body.password)

   if (result.message === 'NOT_FOUND') return res.status(400).json({ message: `Wrong credentials` })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: `Failed to log in` })

   return res.status(200).json(result.body)
})

export default router
