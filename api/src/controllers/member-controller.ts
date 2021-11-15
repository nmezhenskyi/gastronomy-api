import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { MemberService } from '../services/member-service'
import { UserService } from '../services/user-service'
import { paramToInt } from '../common/utils'
import { AuthRequest, Role } from '../common/types'
import { GetMembersQuery, GetUsersQuery } from './utils/member-utils'
import { ApiError } from '../exceptions/api-error'

/**
 * Handles `Member` operations.
 */
export const MemberController = {
   /**
    * Find all member profiles.
    */
   async getAll(req: AuthRequest<GetMembersQuery>, res: Response, next: NextFunction) {
      try {
         const { firstName, lastName, role } = req.query
         const offset = paramToInt(req.query.offset)
         const limit = paramToInt(req.query.limit)
         const searchBy: { firstName?: string, lastName?: string, role?: any } = {}
         if (firstName) searchBy.firstName = firstName
         if (lastName) searchBy.lastName = lastName
         if (role) searchBy.role = role

         const members = await MemberService.find(searchBy, offset, limit)

         res.status(200).json(members)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find one member profile by id.
    */
   async getById(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Member id is missing in the request URI')
         }

         const member = await MemberService.findOne({ id: req.params.id })

         return res.status(200).json(member)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find current member's profile.
    */
   async getSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const member = await MemberService.findOne({ id: req.member!.id })

         return res.status(200).json(member)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find all user profiles.
    */
   async getUsers(req: AuthRequest<GetUsersQuery>, res: Response, next: NextFunction) {
      try {
         const { name, location } = req.params
         const offset = paramToInt(req.query.offset)
         const limit = paramToInt(req.query.limit)
         const searchBy: { name?: string, location?: string } = {}
         if (name) searchBy.name = name
         if (location) searchBy.location = location

         const member = await UserService.find(searchBy, offset, limit)
         if (member.message === 'NOT_FOUND') throw ApiError.NotFound('No users were found')
         if (member.message === 'FAILED') throw ApiError.InternalError('Server failed to find users')
   
         return res.status(200).json(member.body)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Find one user profile by id.
    */
   async getUserById(req: AuthRequest, res: Response, next: NextFunction) { 
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('User id is missing in the request URI')
         }

         const user = await UserService.findOne({ id: req.params.id })
         if (user.message === 'NOT_FOUND') throw ApiError.NotFound('User not found')
         if (user.message === 'FAILED') throw ApiError.InternalError('Server failed to find user')

         return res.status(200).json(user.body)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Create new member account.
    */
   async create(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         const member = await MemberService.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: Role.CREATOR
         })

         return res.status(201).json(member)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Update current member's profile.
    */
   async updateSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         const member = await MemberService.update({
            id: req.member!.id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
         })

         return res.status(200).json(member)
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete current member's profile.
    */
   async deleteSelf(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const member = await MemberService.remove(req.member!.id)

         return res.status(200).json({ message: `Member ${member.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Delete one member profile by id.
    * 
    * - `Supervisor` can only delete Creator or itself.
    * - `Creator` can only delete itself.
    */
   async deleteById(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         if (!req.params || !req.params.id) {
            throw ApiError.BadRequest('Member id is missing in the request URI')
         }

         if (req.member?.id === req.params.id) {
            const member = await MemberService.remove(req.member!.id)
            return res.status(200).json({ message: `Member ${member.id} has been deleted` })
         }

         const memberToDelete = await MemberService.findOne({ id: req.params.id })
         if (req.member?.role === Role.CREATOR || memberToDelete.role.toString() === Role.SUPERVISOR) {
            throw ApiError.Forbidden()
         }

         await MemberService.remove(req.params.id)

         return res.status(200).json({ message: `Member ${memberToDelete.id} has been deleted` })
      }
      catch (err: unknown) {
         return next(err)
      }
   },

   /**
    * Log in and get access token.
    */
   async login(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
            throw ApiError.BadRequest('Invalid data in the request body')
         }

         const accessToken = await MemberService.login(req.body.email, req.body.password)

         return res.status(200).json(accessToken)
      }
      catch (err: unknown) {
         return next(err)
      }
   }
}
