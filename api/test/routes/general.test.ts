import express from 'express'
import request from 'supertest'
import { rateLimiter } from '../../src/middleware/rate-limiter'
import { router } from '../../src/routes/router'
import { notFoundHandler } from '../../src/middleware/not-found-handler'
import { errorHandler } from '../../src/middleware/error-handler'

const app = express()
app.use(rateLimiter)
app.use(router)
app.use(notFoundHandler)
app.use(errorHandler)

describe('Main API End-Points Test Suite:', () => {
   it('GET / - success', async () => {
      const { statusCode } = await request(app).get('/')
      expect(statusCode).toEqual(200)
   })

   it('GET /ping - success', async () => {
      const { statusCode, body } = await request(app).get('/ping')
      expect(statusCode).toEqual(200)
      expect(body).toEqual({ success: true })
   })

   it('GET /abcd - nonexistent', async () => {
      const { statusCode, body } = await request(app).get('/abcd')
      expect(statusCode).toEqual(404)
      expect(body).toHaveProperty('error', 'Requested resource not found')
   })
})
