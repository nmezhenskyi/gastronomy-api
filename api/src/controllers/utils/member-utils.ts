import { Pagination, Role } from '../../common/types'

/**
 * Represents query parameters for the `GET /members` request.
 */
export interface GetMembersQuery extends Pagination {
   firstName?: string
   lastName?: string
   role?: Role.CREATOR | Role.SUPERVISOR
}

/**
 * Represents query parameters for the `GET /users` request.
 */
export interface GetUsersQuery extends Pagination {
   name?: string
   location?: string
}
