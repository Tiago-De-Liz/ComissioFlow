import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import limiter from '@adonisjs/limiter/services/main'

export default class ThrottleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const throttleKey = `login_${ctx.request.ip()}`

    try {
      const limiterInstance = limiter.use({
        requests: 5,
        duration: '15 mins',
        blockDuration: '15 mins',
      })

      await limiterInstance.attempt(throttleKey, async () => {})

      return next()
    } catch (error: any) {
      if (error.status === 429) {
        return ctx.response.tooManyRequests({
          message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
        })
      }
      throw error
    }
  }
}
