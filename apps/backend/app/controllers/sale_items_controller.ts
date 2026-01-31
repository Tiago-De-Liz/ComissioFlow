import type { HttpContext } from '@adonisjs/core/http'
import SaleItem from '#models/sale_item'
import CommissionService from '#services/commission_service'

export default class SaleItemsController {
    async index({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const saleId = request.input('sale_id')

        const query = SaleItem.query()
            .where('company_id', user.companyId)
            .preload('sale')

        if (saleId) {
            query.where('sale_id', saleId)
        }

        const items = await query.exec()
        return response.ok(items)
    }

    async show({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const item = await SaleItem.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('sale')
                .preload('manager', (query) => {
                    query.preload('employee')
                })
                .firstOrFail()

            return response.ok(item)
        } catch (error) {
            return response.notFound({ message: 'Sale item not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const { saleId, description, value, sellerId } = request.only([
            'saleId',
            'description',
            'value',
            'sellerId',
        ])

        try {
            const commissionService = new CommissionService()
            const commissionResult = await commissionService.calculate(sellerId, value)

            const item = await SaleItem.create({
                saleId,
                description,
                value,
                sellerCommissionValue: commissionResult.sellerCommission.totalValue,
                sellerCommissionRule: commissionResult.sellerCommission.rule,
                managerId: commissionResult.managerId,
                managerCommissionValue: commissionResult.managerCommission?.totalValue || 0,
                managerCommissionRule: commissionResult.managerCommission?.rule || null,
                companyId: user.companyId,
            })

            await item.load('sale')

            return response.created(item)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create sale item', error })
        }
    }

    async update({ params, request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const item = await SaleItem.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('sale', (query) => {
                    query.preload('seller')
                })
                .firstOrFail()

            const { description, value } = request.only(['description', 'value'])

            if (value !== undefined && value !== item.value) {
                const commissionService = new CommissionService()
                const commissionResult = await commissionService.calculate(
                    item.sale.sellerId,
                    value
                )

                item.value = value
                item.sellerCommissionValue = commissionResult.sellerCommission.totalValue
                item.sellerCommissionRule = commissionResult.sellerCommission.rule
                item.managerId = commissionResult.managerId
                item.managerCommissionValue = commissionResult.managerCommission?.totalValue || 0
                item.managerCommissionRule = commissionResult.managerCommission?.rule || null
            }

            if (description !== undefined) {
                item.description = description
            }

            await item.save()
            await item.load('sale')

            return response.ok(item)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update sale item', error })
        }
    }

    async destroy({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const item = await SaleItem.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .firstOrFail()
            await item.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete sale item', error })
        }
    }
}
