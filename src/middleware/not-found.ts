import { Request, Response } from 'express'

/**
 * Handles requests to nonexistent endpoints.
 */
export const handleNotFound = (_: Request, res: Response) => {
   return res.status(404).json({ message: 'Requested resource not found' })
}
