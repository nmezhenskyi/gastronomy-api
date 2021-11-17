import { Pagination } from '../../common/types'

/**
 * Represents query parameters for the `GET /cocktails` request.
 */
export interface GetCocktailsQuery extends Pagination {
   name?: string
}
