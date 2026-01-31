import type { HttpContext } from '@adonisjs/core/http'
import Position from '#models/position'

export default class PositionsController {
    async index({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const includeHierarchy = request.input('hierarchy', false)

        const query = Position.query()
            .where('company_id', user.companyId)

        if (includeHierarchy) {
            query.preload('parentPosition').preload('childPositions')
        }

        const positions = await query.exec()
        return response.ok(positions)
    }

    async show({ params, request, response }: HttpContext) {
        const includeHierarchy = request.input('hierarchy', false)

        try {
            const query = Position.query().where('id', params.id)

            if (includeHierarchy) {
                query.preload('parentPosition').preload('childPositions')
            }

            const position = await query.firstOrFail()
            return response.ok(position)
        } catch (error) {
            return response.notFound({ message: 'Position not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const data = request.only(['name', 'parentPositionId'])

        try {
            const position = await Position.create({
                ...data,
                companyId: user.companyId,
            })
            return response.created(position)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create position', error })
        }
    }

    async update({ params, request, response }: HttpContext) {
        try {
            const position = await Position.findOrFail(params.id)
            const data = request.only(['name', 'parentPositionId'])

            position.merge(data)
            await position.save()

            return response.ok(position)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update position', error })
        }
    }

    async destroy({ params, response }: HttpContext) {
        try {
            const position = await Position.findOrFail(params.id)
            await position.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete position', error })
        }
    }

    async hierarchy({ response, auth }: HttpContext) {
        try {
            const user = auth.use('web').user!
            const rootPositions = await Position.query()
                .where('company_id', user.companyId)
                .whereNull('parent_position_id')
                .preload('childPositions', (query) => {
                    query.preload('childPositions')
                })
                .exec()

            return response.ok(rootPositions)
        } catch (error) {
            return response.badRequest({ message: 'Failed to fetch hierarchy', error })
        }
    }
}
