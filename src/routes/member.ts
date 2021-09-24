import express, { Response } from 'express'
import { body, validationResult } from 'express-validator'
import { MemberService } from '../services/member-service'
import { UserService } from '../services/user-service'
import { paramToInt } from '../common/utils'
import { authorize } from '../middleware/authorize'
import { AuthRequest, Pagination, Role } from '../common/types'

const router = express.Router()

interface GetMembersQuery extends Pagination {
   firstName?: string
   lastName?: string
   role?: Role.CREATOR | Role.SUPERVISOR
}

interface GetUsersQuery extends Pagination {
   name?: string
   location?: string
}

/**
 * Register new member Creator account.
 * 
 * @route   POST /member/register
 * @access  Private (Supervisor)
 */
router.post('/', authorize(Role.SUPERVISOR),
body('email').notEmpty().isEmail(),
body('password').notEmpty().isLength({ min: 6, max: 50 }),
body('firstName').notEmpty().isLength({ max: 50 }).trim(),
body('lastName').notEmpty().isLength({ max: 50 }).trim(),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const createdMember = await MemberService.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      role: Role.CREATOR
   })
   if (createdMember.message === 'INVALID') return res.status(400).json({ message: 'Member with this email already exists' })
   if (createdMember.message === 'FAILED' || !createdMember.body) return res.status(500).json({ message: 'Server failed to create member account' })

   return res.status(200).json(createdMember.body)
})

/**
 * Update member information.
 * 
 * @route   PUT /member/profile
 * @access  Private (Creator, Supervisor)
 */
router.put('/profile', authorize([Role.CREATOR, Role.SUPERVISOR]),
body('firstName').optional().isLength({ min: 1, max: 50 }).trim(),
body('lastName').optional().isLength({ min: 1, max: 50 }).trim(),
body('email').optional().isEmail(),
body('password').optional().isLength({ min: 6, max: 50 }),
async (req: AuthRequest, res: Response) => {
   const errors = validationResult(req)
   if (!errors.isEmpty())
      return res.status(400).json({ message: 'Invalid data in the request body', errors: errors.array() })

   const updatedMember = await MemberService.update({
      id: req.member!.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
   })
   if (updatedMember.message === 'NOT_FOUND') return res.status(404).json({ message: 'Member not found' })
   if (updatedMember.message === 'FAILED') return res.status(500).json({ message: 'Server failed to updated member account' })

   return res.status(200).json(updatedMember.body)
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
   if (result.message === 'NOT_FOUND') return res.status(400).json({ message: 'Wrong credentials' })
   if (result.message === 'FAILED' || !result.body) return res.status(500).json({ message: 'Server failed to process log in' })

   return res.status(200).json(result.body)
})

/**
 * Find member accounts.
 * 
 * @route   GET /member/members
 * @access  Private (Supervisor)
 */
router.get('/members', authorize(Role.SUPERVISOR),
async (req: AuthRequest<GetMembersQuery>, res: Response) => {
   const { firstName, lastName, role, offset, limit } = req.query
   const searchBy: { firstName?: string, lastName?: string, role?: any } = {}
   if (firstName) searchBy.firstName = firstName
   if (lastName) searchBy.lastName = lastName
   if (role) searchBy.role = role

   const result = await MemberService.find(searchBy, paramToInt(offset), paramToInt(limit))
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No members were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to find members' })

   return res.status(200).json(result.body)
})
 
/**
 * Find member account by id.
 * 
 * @route   GET /member/members/:id
 * @access  Private (Supervisor)
 */
router.get('/members/:id', authorize(Role.SUPERVISOR),
async (req: AuthRequest, res: Response) => {
   const result = await MemberService.findOne({ id: req.params.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'Member not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to find member' })

   return res.status(200).json(result.body)
})

/**
 * Find user accounts.
 * 
 * @route   GET /member/users
 * @access  Private (Supervisor)
 */
router.get('/members/users', authorize(Role.SUPERVISOR),
async (req: AuthRequest<GetUsersQuery>, res: Response) => {
   const { name, location, offset, limit } = req.params
   const searchBy: { name?: string, location?: string } = {}
   if (name) searchBy.name = name
   if (location) searchBy.location = location

   const result = await UserService.find(searchBy, paramToInt(offset), paramToInt(limit))
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'No users were found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to find users' })

   return res.status(200).json(result.body)
})

/**
 * Find user account by id.
 * 
 * @route   GET /member/users/:id
 * @access  Private (Supervisor)
 */
router.get('/members/users/:id', authorize(Role.SUPERVISOR),
async (req: AuthRequest, res: Response) => {
   const result = await UserService.findOne({ id: req.params.id })
   if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'User not found' })
   if (result.message === 'FAILED') return res.status(500).json({ message: 'Failed to find user' })

   return res.status(200).json(result.body)
})

export default router
