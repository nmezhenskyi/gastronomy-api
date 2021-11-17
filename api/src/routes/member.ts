import express from 'express'
import { body } from 'express-validator'
import { authorize } from '../middleware/authorize'
import { Role } from '../common/types'
import { MemberController } from '../controllers/member-controller'

export const router = express.Router()

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
   MemberController.create)

/**
 * Log in as a member.
 * 
 * @route   POST /member/login
 * @access  Public
 */
router.post('/login',
   body('email').notEmpty().isEmail(),
   body('password').notEmpty().isLength({ min: 6, max: 50 }),
   MemberController.login)

/**
 * Update member information.
 * 
 * @route   PUT /member/profile
 * @access  Private (Creator, Supervisor)
 */
router.put('/profile',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   body('firstName').optional().isLength({ min: 1, max: 50 }).trim(),
   body('lastName').optional().isLength({ min: 1, max: 50 }).trim(),
   body('email').optional().isEmail(),
   body('password').optional().isLength({ min: 6, max: 50 }),
   MemberController.updateSelf)

/**
 * Delete current member's profile.
 * 
 * @route   DELETE /member/profile
 * @access  Private (Creator, Supervisor)
 */
router.delete('/profile',
   authorize([Role.CREATOR, Role.SUPERVISOR]),
   MemberController.deleteSelf)

/**
 * Delete any member profile.
 * Supervisor can only delete Creator or itself.
 * 
 * @route   DELETE /member/:id
 * @access  Private (Supervisor)
 */
router.delete('/:id',
   authorize(Role.SUPERVISOR),
   MemberController.deleteById)

/**
 * Find member accounts.
 * 
 * @route   GET /member/members
 * @access  Private (Supervisor)
 */
router.get('/members',
   authorize(Role.SUPERVISOR),
   MemberController.getAll)
 
/**
 * Find user accounts.
 * 
 * @route   GET /member/users
 * @access  Private (Supervisor)
 */
router.get('/members/users', 
   authorize(Role.SUPERVISOR),
   MemberController.getUsers)

/**
 * Find user account by id.
 * 
 * @route   GET /member/users/:id
 * @access  Private (Supervisor)
 */
router.get('/members/users/:id',
   authorize(Role.SUPERVISOR),
   MemberController.getUserById)

/**
 * Find member account by id.
 * 
 * @route   GET /member/members/:id
 * @access  Private (Supervisor)
 */
router.get('/members/:id',
   authorize(Role.SUPERVISOR),
   MemberController.getById)
