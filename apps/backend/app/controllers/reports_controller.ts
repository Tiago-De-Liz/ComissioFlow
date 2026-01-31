import type { HttpContext } from '@adonisjs/core/http'
import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import Seller from '#models/seller'
import { DateTime } from 'luxon'
import PDFDocument from 'pdfkit'

export default class ReportsController {
  async commissions({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user!
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')
    const sellerId = request.input('seller_id')

    try {
      const salesQuery = Sale.query()
        .where('company_id', user.companyId)
        .preload('seller', (query) => {
          query.preload('employee')
        })
        .preload('items')

      if (startDate) {
        salesQuery.where('sale_date', '>=', startDate)
      }

      if (endDate) {
        salesQuery.where('sale_date', '<=', endDate)
      }

      if (sellerId) {
        salesQuery.where('seller_id', sellerId)
      }

      const sales = await salesQuery.exec()

      const sellerMap = new Map<
        string,
        {
          sellerId: string
          sellerName: string
          totalSales: number
          sellerCommissionTotal: number
          managerCommissionTotal: number
        }
      >()

      for (const sale of sales) {
        const sellerId = sale.sellerId
        const sellerName = sale.seller?.employee?.name || 'Unknown'

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            sellerId,
            sellerName,
            totalSales: 0,
            sellerCommissionTotal: 0,
            managerCommissionTotal: 0,
          })
        }

        const sellerData = sellerMap.get(sellerId)!
        sellerData.totalSales += 1

        for (const item of sale.items) {
          sellerData.sellerCommissionTotal += Number(item.sellerCommissionValue) || 0
        }
      }

      const allItems = await SaleItem.query()
        .where('company_id', user.companyId)
        .whereNotNull('manager_id')
        .preload('sale', (query) => {
          if (startDate) {
            query.where('sale_date', '>=', startDate)
          }
          if (endDate) {
            query.where('sale_date', '<=', endDate)
          }
        })

      for (const item of allItems) {
        if (item.managerId) {
          const managerSeller = await Seller.query()
            .where('employee_id', item.managerId)
            .where('company_id', user.companyId)
            .preload('employee')
            .first()

          if (managerSeller) {
            const sellerId = managerSeller.id
            const sellerName = managerSeller.employee?.name || 'Unknown'

            if (!sellerMap.has(sellerId)) {
              sellerMap.set(sellerId, {
                sellerId,
                sellerName,
                totalSales: 0,
                sellerCommissionTotal: 0,
                managerCommissionTotal: 0,
              })
            }

            const sellerData = sellerMap.get(sellerId)!
            sellerData.managerCommissionTotal += Number(item.managerCommissionValue) || 0
          }
        }
      }

      const sellers = Array.from(sellerMap.values()).map((seller) => ({
        sellerId: seller.sellerId,
        sellerName: seller.sellerName,
        totalSales: seller.totalSales,
        sellerCommissionTotal: Number(seller.sellerCommissionTotal.toFixed(2)),
        managerCommissionTotal: Number(seller.managerCommissionTotal.toFixed(2)),
        commissionTotal: Number(
          (seller.sellerCommissionTotal + seller.managerCommissionTotal).toFixed(2)
        ),
      }))

      const grandTotal = {
        sales: sellers.reduce((acc, s) => acc + s.totalSales, 0),
        sellerCommissions: Number(
          sellers.reduce((acc, s) => acc + s.sellerCommissionTotal, 0).toFixed(2)
        ),
        managerCommissions: Number(
          sellers.reduce((acc, s) => acc + s.managerCommissionTotal, 0).toFixed(2)
        ),
        total: Number(sellers.reduce((acc, s) => acc + s.commissionTotal, 0).toFixed(2)),
      }

      return response.ok({
        period: {
          start: startDate || null,
          end: endDate || null,
        },
        sellers: sellers.sort((a, b) => b.commissionTotal - a.commissionTotal),
        grandTotal,
      })
    } catch (error) {
      return response.badRequest({ message: 'Failed to generate report', error })
    }
  }

  async commissionsPdf({ request, response, auth }: HttpContext) {
    const user = auth.use('web').user!
    const startDate = request.input('start_date')
    const endDate = request.input('end_date')
    const sellerId = request.input('seller_id')

    try {
      const salesQuery = Sale.query()
        .where('company_id', user.companyId)
        .preload('seller', (query) => {
          query.preload('employee')
        })
        .preload('items')

      if (startDate) {
        salesQuery.where('sale_date', '>=', startDate)
      }

      if (endDate) {
        salesQuery.where('sale_date', '<=', endDate)
      }

      if (sellerId) {
        salesQuery.where('seller_id', sellerId)
      }

      const sales = await salesQuery.exec()

      const sellerMap = new Map<
        string,
        {
          sellerId: string
          sellerName: string
          totalSales: number
          sellerCommissionTotal: number
          managerCommissionTotal: number
        }
      >()

      for (const sale of sales) {
        const sellerId = sale.sellerId
        const sellerName = sale.seller?.employee?.name || 'Unknown'

        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            sellerId,
            sellerName,
            totalSales: 0,
            sellerCommissionTotal: 0,
            managerCommissionTotal: 0,
          })
        }

        const sellerData = sellerMap.get(sellerId)!
        sellerData.totalSales += 1

        for (const item of sale.items) {
          sellerData.sellerCommissionTotal += Number(item.sellerCommissionValue) || 0
        }
      }

      const allItems = await SaleItem.query()
        .where('company_id', user.companyId)
        .whereNotNull('manager_id')
        .preload('sale', (query) => {
          if (startDate) {
            query.where('sale_date', '>=', startDate)
          }
          if (endDate) {
            query.where('sale_date', '<=', endDate)
          }
        })

      for (const item of allItems) {
        if (item.managerId) {
          const managerSeller = await Seller.query()
            .where('employee_id', item.managerId)
            .where('company_id', user.companyId)
            .preload('employee')
            .first()

          if (managerSeller) {
            const sellerId = managerSeller.id
            const sellerName = managerSeller.employee?.name || 'Unknown'

            if (!sellerMap.has(sellerId)) {
              sellerMap.set(sellerId, {
                sellerId,
                sellerName,
                totalSales: 0,
                sellerCommissionTotal: 0,
                managerCommissionTotal: 0,
              })
            }

            const sellerData = sellerMap.get(sellerId)!
            sellerData.managerCommissionTotal += Number(item.managerCommissionValue) || 0
          }
        }
      }

      const sellers = Array.from(sellerMap.values())
        .map((seller) => ({
          sellerId: seller.sellerId,
          sellerName: seller.sellerName,
          totalSales: seller.totalSales,
          sellerCommissionTotal: Number(seller.sellerCommissionTotal.toFixed(2)),
          managerCommissionTotal: Number(seller.managerCommissionTotal.toFixed(2)),
          commissionTotal: Number(
            (seller.sellerCommissionTotal + seller.managerCommissionTotal).toFixed(2)
          ),
        }))
        .sort((a, b) => b.commissionTotal - a.commissionTotal)

      const grandTotal = {
        sales: sellers.reduce((acc, s) => acc + s.totalSales, 0),
        sellerCommissions: Number(
          sellers.reduce((acc, s) => acc + s.sellerCommissionTotal, 0).toFixed(2)
        ),
        managerCommissions: Number(
          sellers.reduce((acc, s) => acc + s.managerCommissionTotal, 0).toFixed(2)
        ),
        total: Number(sellers.reduce((acc, s) => acc + s.commissionTotal, 0).toFixed(2)),
      }

      const doc = new PDFDocument({ margin: 50 })

      const buffers: Buffer[] = []
      const pdfPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk) => buffers.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(buffers)))
        doc.on('error', reject)
      })

      doc.fontSize(20).text('Relatório de Comissões', { align: 'center' })
      doc.moveDown()

      if (startDate || endDate) {
        doc.fontSize(12).text(
          `Período: ${startDate ? DateTime.fromISO(startDate).toFormat('dd/MM/yyyy') : 'Início'} - ${
            endDate ? DateTime.fromISO(endDate).toFormat('dd/MM/yyyy') : 'Hoje'
          }`,
          { align: 'center' }
        )
        doc.moveDown()
      }

      doc
        .fontSize(10)
        .text(`Gerado em: ${DateTime.now().toFormat('dd/MM/yyyy HH:mm')}`, { align: 'right' })
      doc.moveDown(2)

      doc.fontSize(14).text('Resumo Geral', { underline: true })
      doc.moveDown()
      doc.fontSize(11)
      doc.text(`Total de Vendas: ${grandTotal.sales}`)
      doc.text(`Comissões Vendedores: R$ ${grandTotal.sellerCommissions.toFixed(2)}`)
      doc.text(`Comissões Gerentes: R$ ${grandTotal.managerCommissions.toFixed(2)}`)
      doc.font('Helvetica-Bold').text(`Total Geral: R$ ${grandTotal.total.toFixed(2)}`).font('Helvetica')
      doc.moveDown(2)

      doc.fontSize(14).text('Detalhamento por Vendedor', { underline: true })
      doc.moveDown()

      const tableTop = doc.y
      const col1 = 50
      const col2 = 200
      const col3 = 280
      const col4 = 360
      const col5 = 450

      doc.fontSize(10).font('Helvetica-Bold')
      doc.text('Vendedor', col1, tableTop)
      doc.text('Vendas', col2, tableTop)
      doc.text('Comissão', col3, tableTop)
      doc.text('Gerente', col4, tableTop)
      doc.text('Total', col5, tableTop)

      doc.font('Helvetica')
      let y = tableTop + 20

      for (const seller of sellers) {
        if (y > 700) {
          doc.addPage()
          y = 50
        }

        doc.text(seller.sellerName.substring(0, 20), col1, y)
        doc.text(seller.totalSales.toString(), col2, y)
        doc.text(`R$ ${seller.sellerCommissionTotal.toFixed(2)}`, col3, y)
        doc.text(`R$ ${seller.managerCommissionTotal.toFixed(2)}`, col4, y)
        doc.text(`R$ ${seller.commissionTotal.toFixed(2)}`, col5, y)

        y += 20
      }

      doc
        .fontSize(8)
        .text(
          'ComissioFlow - Sistema de Gestão de Comissões',
          50,
          doc.page.height - 50,
          { align: 'center' }
        )

      doc.end()

      const pdfData = await pdfPromise
      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `attachment; filename=relatorio-comissoes-${DateTime.now().toFormat('yyyy-MM-dd')}.pdf`
      )
      return response.send(pdfData)
    } catch (error) {
      return response.badRequest({ message: 'Failed to generate PDF', error })
    }
  }
}
