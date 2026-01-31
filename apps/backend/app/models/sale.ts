import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Seller from './seller.js'
import SaleItem from './sale_item.js'
import Company from './company.js'

export default class Sale extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare sellerId: string

  @column.dateTime()
  declare saleDate: DateTime

  @column()
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Seller, {
    foreignKey: 'sellerId',
  })
  declare seller: BelongsTo<typeof Seller>

  @hasMany(() => SaleItem, {
    foreignKey: 'saleId',
  })
  declare items: HasMany<typeof SaleItem>
}