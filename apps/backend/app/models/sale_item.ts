import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Sale from './sale.js'
import Seller from './seller.js'
import Company from './company.js'

export default class SaleItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare saleId: string

  @column()
  declare description: string

  @column()
  declare value: number

  @column()
  declare sellerCommissionValue: number

  @column()
  declare sellerCommissionRule: string | null

  @column()
  declare managerId: string | null

  @column()
  declare managerCommissionValue: number

  @column()
  declare managerCommissionRule: string | null

  @column()
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Sale, {
    foreignKey: 'saleId',
  })
  declare sale: BelongsTo<typeof Sale>

  @belongsTo(() => Seller, {
    foreignKey: 'managerId',
  })
  declare manager: BelongsTo<typeof Seller>
}