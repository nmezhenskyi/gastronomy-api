/**
 * Represents an API error.
 * 
 * Contains status code for the response and error message.
 */
 export class ApiError extends Error {
   status: number

   constructor(status: number, message: string) {
      super(message)
      this.status = status
   }

   static BadRequest(message: string) {
      return new ApiError(400, message)
   }

   static UnauthorizedError(message?: string) {
      return new ApiError(401, message || 'Not Authorized')
   }

   static NotFound(message: string) {
      return new ApiError(404, message)
   }

   static InternalError(message: string) {
      return new ApiError(500, message)
   }
}
