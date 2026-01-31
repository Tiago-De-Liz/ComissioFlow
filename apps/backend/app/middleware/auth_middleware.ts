import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import Employee from '#models/employee'

export default class AuthMiddleware {
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    const user = ctx.auth.use('web').user
    if (user && user.mustChangePassword) {
      const allowedRoutes = ['/api/auth/me', '/api/auth/change-password', '/api/auth/logout']
      if (!allowedRoutes.includes(ctx.request.url())) {
        return ctx.response.forbidden({
          message: 'Você deve trocar sua senha antes de continuar',
          mustChangePassword: true,
        })
      }
    }

    if (user) {
      const employee = await Employee.query()
        .where('user_id', user.id)
        .first()

      if (employee && !employee.isActive) {
        await ctx.auth.use('web').logout()
        return ctx.response.forbidden({
          message: 'Sua conta está inativa. Entre em contato com o administrador.',
        })
      }
    }

    return next()
  }
}