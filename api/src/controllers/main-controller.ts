import { Request, Response, NextFunction } from 'express'
import config from 'config'

/**
 * Handles basic functionality of the API.
 */
export const MainController = {
   /**
    * @returns documentation url
    */
   root(_: Request, res: Response, __: NextFunction) {   
      return res.status(200).json({ documentation: config.get('documentation') })
   },

   /**
    * Method to check the state of the API.
    * 
    * @returns `{ success: true }`
    */
   ping(_: Request, res: Response, __: NextFunction) {
      return res.status(200).json({ success: true })
   }
}
