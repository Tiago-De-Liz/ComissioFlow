import type { HttpContext } from '@adonisjs/core/http'
import Seller from '#models/seller'

export default class SellersController {
    async index({ response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const sellers = await Seller.query()
            .where('company_id', user.companyId)
            .preload('employee', (query) => {
                query.preload('position')
            })
            .exec()

        return response.ok(sellers)
    }

    async show({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const seller = await Seller.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('employee', (query) => {
                    query.preload('position')
                })
                .preload('sales')
                .firstOrFail()

            return response.ok(seller)
        } catch (error) {
            return response.notFound({ message: 'Seller not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const data = request.only(['employeeId', 'fixedValue', 'percentageValue'])

        try {
            const seller = await Seller.create({
                ...data,
                companyId: user.companyId,
            })
            await seller.load('employee')

            return response.created(seller)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create seller', error })
        }
    }

    async update({ params, request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const seller = await Seller.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .firstOrFail()
            const data = request.only(['fixedValue', 'percentageValue'])

            seller.merge(data)
            await seller.save()
            await seller.load('employee')

            return response.ok(seller)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update seller', error })
        }
    }

    async destroy({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const seller = await Seller.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .firstOrFail()
            await seller.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete seller', error })
        }
    }

    async byEmployee({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const seller = await Seller.query()
                .where('employee_id', params.employeeId)
                .where('company_id', user.companyId)
                .preload('employee', (query) => {
                    query.preload('position')
                })
                .firstOrFail()

            return response.ok(seller)
        } catch (error) {
            return response.notFound({ message: 'Seller not found for this employee' })
        }
    }
}
