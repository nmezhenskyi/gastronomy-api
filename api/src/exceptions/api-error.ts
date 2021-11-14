/**
 * Represents an API error.
 * 
 * Contains status code for the response and error message.
 */
 export class ApiError extends Error {
    /**
     * HTTP Response Status Code.
     */
   status: number

   constructor(status: number, message: string) {
      super(message)
      this.status = status
   }

   static BadRequest(message: string) {
      return new ApiError(400, message)
   }

   static Unauthorized(message?: string) {
      return new ApiError(401, message || 'Not Authorized')
   }

   static Forbidden(message?: string) {
      return new ApiError(403, message || 'Forbidden')
   }

   static NotFound(message: string) {
      return new ApiError(404, message)
   }

   static TooManyRequests(message?: string) {
      return new ApiError(429, message || 'Too Many Requests')
   }

   static InternalError(message: string) {
      return new ApiError(500, message)
   }
}
