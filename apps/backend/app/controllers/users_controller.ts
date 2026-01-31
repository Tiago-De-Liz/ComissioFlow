import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
    async index({ response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        const users = await User.query()
            .where('company_id', currentUser.companyId)
            .exec()
        return response.ok(users)
    }

    async show({ params, response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        try {
            const user = await User.query()
                .where('id', params.id)
                .where('company_id', currentUser.companyId)
                .firstOrFail()
            return response.ok(user)
        } catch (error) {
            return response.notFound({ message: 'User not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        const data = request.only(['name', 'email', 'password'])

        try {
            const user = await User.create({
                ...data,
                companyId: currentUser.companyId,
            })
            return response.created(user)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create user', error })
        }
    }

    async update({ params, request, response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        try {
            const user = await User.query()
                .where('id', params.id)
                .where('company_id', currentUser.companyId)
                .firstOrFail()
            const data = request.only(['name', 'email', 'password'])

            user.merge(data)
            await user.save()

            return response.ok(user)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update user', error })
        }
    }

    async destroy({ params, response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        try {
            const user = await User.query()
                .where('id', params.id)
                .where('company_id', currentUser.companyId)
                .firstOrFail()
            await user.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete user', error })
        }
    }
}
