import { Pagination } from '../../common/types'

/**
 * Represents query parameters for the `GET /meals` request.
 */
export interface GetMealsQuery extends Pagination {
   name?: string
   cuisine?: string
}
