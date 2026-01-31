import env from '#start/env'
import { defineConfig } from '@adonisjs/cors'

const allowedOrigins = ['http://localhost:5173']
const frontendUrl = env.get('FRONTEND_URL')
if (frontendUrl) {
    allowedOrigins.push(frontendUrl)
}

const corsConfig = defineConfig({
    enabled: true,
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
    headers: true,
    exposeHeaders: [],
    credentials: true,
    maxAge: 90,
})

export default corsConfig
