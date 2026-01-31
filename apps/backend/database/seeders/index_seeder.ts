import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'
import User from '#models/user'
import Position from '#models/position'
import Employee from '#models/employee'
import Seller from '#models/seller'
import Sale from '#models/sale'
import SaleItem from '#models/sale_item'
import CommissionService from '#services/commission_service'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // 1. Create default company
    const company = await Company.firstOrCreate(
      { document: '12345678000190' },
      {
        name: 'Empresa Demo',
        document: '12345678000190',
      }
    )

    console.log(`Company created: ${company.name} (${company.id})`)

    // 2. Create users linked to company
    const adminUser = await User.firstOrCreate(
      { email: 'admin@comissioflow.com' },
      {
        name: 'Admin User',
        email: 'admin@comissioflow.com',
        password: 'Admin@123',
        mustChangePassword: false,
        companyId: company.id,
      }
    )

    const pedroUser = await User.firstOrCreate(
      { email: 'pedro@comissioflow.com' },
      {
        name: 'Pedro Henrique',
        email: 'pedro@comissioflow.com',
        password: 'Pedro@123',
        mustChangePassword: false,
        companyId: company.id,
      }
    )

    const juliaUser = await User.firstOrCreate(
      { email: 'julia@comissioflow.com' },
      {
        name: 'Julia Martins',
        email: 'julia@comissioflow.com',
        password: 'Temp@123',
        mustChangePassword: true,
        companyId: company.id,
      }
    )

    console.log(`Users created: ${adminUser.name}, ${pedroUser.name}, ${juliaUser.name}`)

    // 3. Create positions linked to company
    const ceo = await Position.firstOrCreate(
      { name: 'CEO', companyId: company.id },
      {
        name: 'CEO',
        parentPositionId: null,
        companyId: company.id,
      }
    )

    const gerenteVendas = await Position.firstOrCreate(
      { name: 'Gerente de Vendas', companyId: company.id },
      {
        name: 'Gerente de Vendas',
        parentPositionId: ceo.id,
        companyId: company.id,
      }
    )

    const vendedor = await Position.firstOrCreate(
      { name: 'Vendedor', companyId: company.id },
      {
        name: 'Vendedor',
        parentPositionId: gerenteVendas.id,
        companyId: company.id,
      }
    )

    const gerenteRH = await Position.firstOrCreate(
      { name: 'Gerente de RH', companyId: company.id },
      {
        name: 'Gerente de RH',
        parentPositionId: ceo.id,
        companyId: company.id,
      }
    )

    await Position.firstOrCreate(
      { name: 'Assistente de RH', companyId: company.id },
      {
        name: 'Assistente de RH',
        parentPositionId: gerenteRH.id,
        companyId: company.id,
      }
    )

    console.log(`Positions created: CEO, Gerente de Vendas, Vendedor, Gerente de RH, Assistente de RH`)

    // 4. Create employees linked to company
    const anaPaula = await Employee.firstOrCreate(
      { document: '23456789011' },
      {
        name: 'Ana Paula',
        document: '23456789011',
        positionId: gerenteVendas.id,
        userId: pedroUser.id,
        isActive: true,
        companyId: company.id,
      }
    )

    const carlosSilva = await Employee.firstOrCreate(
      { document: '34567890122' },
      {
        name: 'Carlos Silva',
        document: '34567890122',
        positionId: vendedor.id,
        userId: null,
        isActive: true,
        companyId: company.id,
      }
    )

    const mariaOliveira = await Employee.firstOrCreate(
      { document: '45678901233' },
      {
        name: 'Maria Oliveira',
        document: '45678901233',
        positionId: vendedor.id,
        userId: juliaUser.id,
        isActive: true,
        companyId: company.id,
      }
    )

    await Employee.firstOrCreate(
      { document: '56789012344' },
      {
        name: 'Fernando Costa',
        document: '56789012344',
        positionId: vendedor.id,
        userId: null,
        isActive: false,
        companyId: company.id,
      }
    )

    console.log(`Employees created: Ana Paula, Carlos Silva, Maria Oliveira, Fernando Costa`)

    // 5. Create sellers linked to company
    const anaPaulaSeller = await Seller.firstOrCreate(
      { employeeId: anaPaula.id },
      {
        employeeId: anaPaula.id,
        fixedValue: 100.0,
        percentageValue: 5.0,
        companyId: company.id,
      }
    )

    const carlosSeller = await Seller.firstOrCreate(
      { employeeId: carlosSilva.id },
      {
        employeeId: carlosSilva.id,
        fixedValue: 50.0,
        percentageValue: 3.0,
        companyId: company.id,
      }
    )

    const mariaSeller = await Seller.firstOrCreate(
      { employeeId: mariaOliveira.id },
      {
        employeeId: mariaOliveira.id,
        fixedValue: 75.0,
        percentageValue: 4.0,
        companyId: company.id,
      }
    )

    console.log(`Sellers created: Ana Paula, Carlos Silva, Maria Oliveira`)

    // 6. Create sales and items with commissions
    const commissionService = new CommissionService()

    // Sale 1 - Carlos
    const sale1 = await Sale.firstOrCreate(
      { sellerId: carlosSeller.id, saleDate: DateTime.fromISO('2024-01-15') },
      {
        sellerId: carlosSeller.id,
        saleDate: DateTime.fromISO('2024-01-15'),
        companyId: company.id,
      }
    )

    const sale1ItemValue = 5000.0
    const sale1Commission = await commissionService.calculate(carlosSeller.id, sale1ItemValue)

    await SaleItem.firstOrCreate(
      { saleId: sale1.id, description: 'Produto A' },
      {
        saleId: sale1.id,
        description: 'Produto A',
        value: sale1ItemValue,
        sellerCommissionValue: sale1Commission.sellerCommission.totalValue,
        sellerCommissionRule: sale1Commission.sellerCommission.rule,
        managerId: sale1Commission.managerId,
        managerCommissionValue: sale1Commission.managerCommission?.totalValue || 0,
        managerCommissionRule: sale1Commission.managerCommission?.rule || null,
        companyId: company.id,
      }
    )

    // Sale 2 - Maria
    const sale2 = await Sale.firstOrCreate(
      { sellerId: mariaSeller.id, saleDate: DateTime.fromISO('2024-01-20') },
      {
        sellerId: mariaSeller.id,
        saleDate: DateTime.fromISO('2024-01-20'),
        companyId: company.id,
      }
    )

    const sale2ItemValue = 8000.0
    const sale2Commission = await commissionService.calculate(mariaSeller.id, sale2ItemValue)

    await SaleItem.firstOrCreate(
      { saleId: sale2.id, description: 'Produto B' },
      {
        saleId: sale2.id,
        description: 'Produto B',
        value: sale2ItemValue,
        sellerCommissionValue: sale2Commission.sellerCommission.totalValue,
        sellerCommissionRule: sale2Commission.sellerCommission.rule,
        managerId: sale2Commission.managerId,
        managerCommissionValue: sale2Commission.managerCommission?.totalValue || 0,
        managerCommissionRule: sale2Commission.managerCommission?.rule || null,
        companyId: company.id,
      }
    )

    // Sale 3 - Ana Paula
    const sale3 = await Sale.firstOrCreate(
      { sellerId: anaPaulaSeller.id, saleDate: DateTime.fromISO('2024-02-01') },
      {
        sellerId: anaPaulaSeller.id,
        saleDate: DateTime.fromISO('2024-02-01'),
        companyId: company.id,
      }
    )

    const sale3ItemValue = 12000.0
    const sale3Commission = await commissionService.calculate(anaPaulaSeller.id, sale3ItemValue)

    await SaleItem.firstOrCreate(
      { saleId: sale3.id, description: 'Produto C' },
      {
        saleId: sale3.id,
        description: 'Produto C',
        value: sale3ItemValue,
        sellerCommissionValue: sale3Commission.sellerCommission.totalValue,
        sellerCommissionRule: sale3Commission.sellerCommission.rule,
        managerId: sale3Commission.managerId,
        managerCommissionValue: sale3Commission.managerCommission?.totalValue || 0,
        managerCommissionRule: sale3Commission.managerCommission?.rule || null,
        companyId: company.id,
      }
    )

    console.log(`Sales created: 3 sales with items and commissions`)
    console.log(`✅ Seeder completed successfully!`)
  }
}
