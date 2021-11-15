import { getRepository } from 'typeorm'
import bcrypt from 'bcrypt'
import { Member, MemberRole } from '../models/member'
import { TokenService } from './token-service'
import { ApiError } from '../exceptions/api-error'

export const MemberService = {
   /**
    * Finds members in the database that match given conditions.
    * 
    * @param searchBy Search condition.
    * @param offset Search offset.
    * @param limit Search limit.
    * @returns Array of found members.
    */
   async find(searchBy?: {
      firstName?: string,
      lastName?: string,
      role?: MemberRole
   }, offset = 0, limit = 10): Promise<Member[]> {
      const repo = getRepository(Member)

      const members = await repo.find({
         select: ['id', 'firstName', 'lastName', 'email', 'role'],
         where: searchBy,
         order: { createdAt: 'DESC' },
         skip: offset,
         take: limit
      })

      if (!members || !members.length) throw ApiError.NotFound('No members were found')

      return members
   },

   /**
    * Finds one member in the database that matches given conditions.
    * 
    * @param searchBy Search condition.
    * @returns Found member.
    */
   async findOne(searchBy?: { id?: string, email?: string }): Promise<Member> {
      const repo = getRepository(Member)

      const member = await repo.findOne({
         select: ['id', 'firstName', 'lastName', 'email', 'role'],
         where: searchBy
      })

      if (!member) throw ApiError.NotFound('Member not found')

      return member
   },

   /**
    * Finds member by credetials.  
    * If password doesn't match, throws `ApiError.NotFound`.
    * 
    * @param email Member's email.
    * @param rawPassword Member's password.
    * @returns Found member.
    */
   async findByCredentials(email: string, rawPassword: string): Promise<Member> {
      const repo = getRepository(Member)

      const member = await repo.findOne({ where: { email }})

      if (!member) throw ApiError.NotFound('Member not found')

      const passwordsMatch = await bcrypt.compare(rawPassword, member.password)

      if (!passwordsMatch) throw ApiError.NotFound('Member not found')

      return { ...member, password: '' }
   },

   /**
    * Adds the member to the database.
    * 
    * @param memberDto New member information.
    * @returns Created member.
    */
   async create(memberDto: {
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      role: 'Creator' | 'Supervisor'
   }): Promise<Member> {
      const repo = getRepository(Member)

      const found = await repo.findOne({ email: memberDto.email })

      if (found) throw ApiError.BadRequest('Member account with this email already exists')

      const member = new Member()
      member.email = memberDto.email
      member.password = await bcrypt.hash(memberDto.password, 10)
      member.firstName = memberDto.firstName
      member.lastName = memberDto.lastName
      if (memberDto.role === 'Creator') member.role = MemberRole.CREATOR
      else if (memberDto.role === 'Supervisor') member.role = MemberRole.SUPERVISOR

      const created = await repo.save(member)

      return { ...created, password: '' }
   },

   /**
    * Verifies member's credentials and issues an access token.
    * 
    * @param email Member's email.
    * @param password Member's password.
    * @returns Access token string.
    */
   async login(email: string, password: string): Promise<string> {
      const member = await this.findByCredentials(email, password)

      const { accessToken } = TokenService.generateTokens({ member: { id: member.id, role: member.role.toString() } })

      return accessToken
   },

   /**
    * Updates the member in the database.
    * 
    * @param memberDto Member id and updated information.
    * @returns Updated member.
    */
   async update(memberDto: {
      id: string,
      email?: string,
      password?: string,
      firstName?: string,
      lastName?: string,
      role?: 'Creator' | 'Supervisor'
   }): Promise<Member> {
      const repo = getRepository(Member)

      const member = await repo.findOne(memberDto.id)

      if (!member) throw ApiError.NotFound('Member not found')

      if (memberDto.email) member.email = memberDto.email
      if (memberDto.password) member.password = await bcrypt.hash(memberDto.password, 10)
      if (memberDto.firstName) member.firstName = memberDto.firstName
      if (memberDto.lastName) member.lastName = memberDto.lastName
      if (memberDto.role) {
         if (memberDto.role === 'Creator') member.role = MemberRole.CREATOR
         else if (memberDto.role === 'Supervisor') member.role = MemberRole.SUPERVISOR
      }

      const updated = await repo.save(member)

      return { ...updated, password: '' }
   },

   /**
    * Removes specified member account from the database.
    * 
    * @param id Member id.
    * @returns Removed member.
    */
   async remove(id: string): Promise<Member> {
      const repository = getRepository(Member)

      const member = await repository.findOne(id)

      if (!member) throw ApiError.NotFound('Member not found')

      await repository.remove(member)

      return member
   }
}
