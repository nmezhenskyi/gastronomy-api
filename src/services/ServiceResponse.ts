/**
 * Represents a general service response throughout this API.
 * Contains mandatory properties 'success' and 'message', and an optional property 'body'.
 * 
 * - ```success``` - Informs whether the database query was successful or failed.
 * - ```message``` - Contains message describing the result of the query.
 * - ```body``` - Contains actual data of type ```T``` returned by the query, if any. Present only if 'success' is true.
 */
export interface ServiceResponse<T> {
   success: boolean,
   message: 'FOUND' | 'NOT_FOUND' | 'CREATED' | 'UPDATED' | 'REMOVED' | 'INVALID_DATA' | 'FAILED',
   body?: T
}
