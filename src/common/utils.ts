export const paramToInt = (str: string): number | undefined => {
   const parsed = parseInt(str)

   if (isNaN(parsed)) return undefined

   return parsed
}
