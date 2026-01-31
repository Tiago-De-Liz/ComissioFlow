import type { HttpContext } from '@adonisjs/core/http'
import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import CommissionService from '#services/commission_service'
import { DateTime } from 'luxon'

export default class SalesController {
    async index({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const startDate = request.input('start_date')
        const endDate = request.input('end_date')
        const sellerId = request.input('seller_id')

        const query = Sale.query()
            .where('company_id', user.companyId)
            .preload('seller', (query) => {
                query.preload('employee')
            })
            .preload('items')

        if (startDate) {
            query.where('sale_date', '>=', startDate)
        }

        if (endDate) {
            query.where('sale_date', '<=', endDate)
        }

        if (sellerId) {
            query.where('seller_id', sellerId)
        }

        const sales = await query.exec()
        return response.ok(sales)
    }

    async show({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const sale = await Sale.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('seller', (query) => {
                    query.preload('employee')
                })
                .preload('items')
                .firstOrFail()

            return response.ok(sale)
        } catch (error) {
            return response.notFound({ message: 'Sale not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const { sellerId, saleDate, items } = request.only([
            'sellerId',
            'saleDate',
            'items',
        ])

        try {
            const sale = await Sale.create({
                sellerId,
                saleDate: saleDate ? DateTime.fromISO(saleDate) : DateTime.now(),
                companyId: user.companyId,
            })

            const commissionService = new CommissionService()

            for (const item of items) {
                const commissionResult = await commissionService.calculate(sellerId, item.value)

                await SaleItem.create({
                    saleId: sale.id,
                    description: item.description,
                    value: item.value,
                    sellerCommissionValue: commissionResult.sellerCommission.totalValue,
                    sellerCommissionRule: commissionResult.sellerCommission.rule,
                    managerId: commissionResult.managerId,
                    managerCommissionValue: commissionResult.managerCommission?.totalValue || 0,
                    managerCommissionRule: commissionResult.managerCommission?.rule || null,
                    companyId: user.companyId,
                })
            }

            await sale.load('seller')
            await sale.load('items')

            return response.created(sale)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create sale', error })
        }
    }

    async update({ params, request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const sale = await Sale.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .firstOrFail()
            const data = request.only(['sellerId', 'saleDate'])

            if (data.saleDate) {
                data.saleDate = DateTime.fromISO(data.saleDate)
            }

            sale.merge(data)
            await sale.save()

            await sale.load('seller')
            await sale.load('items')

            return response.ok(sale)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update sale', error })
        }
    }

    async destroy({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const sale = await Sale.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .firstOrFail()
            await sale.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete sale', error })
        }
    }

    async commissionSummary({ params, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        try {
            const sale = await Sale.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('items')
                .firstOrFail()

            let totalSellerCommission = 0
            let totalManagerCommission = 0

            for (const item of sale.items) {
                totalSellerCommission += Number(item.sellerCommissionValue)
                totalManagerCommission += Number(item.managerCommissionValue)
            }

            return response.ok({
                saleId: sale.id,
                totalSellerCommission,
                totalManagerCommission,
                totalCommission: totalSellerCommission + totalManagerCommission,
                items: sale.items.map((item) => ({
                    id: item.id,
                    description: item.description,
                    value: item.value,
                    sellerCommission: item.sellerCommissionValue,
                    sellerRule: item.sellerCommissionRule,
                    managerCommission: item.managerCommissionValue,
                    managerRule: item.managerCommissionRule,
                })),
            })
        } catch (error) {
            return response.notFound({ message: 'Sale not found' })
        }
    }
}
