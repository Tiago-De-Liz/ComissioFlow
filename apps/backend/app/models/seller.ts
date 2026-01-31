import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'
import Sale from './sale.js'
import SaleItem from './sale_item.js'
import Company from './company.js'

export default class Seller extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare employeeId: string

  @column()
  declare fixedValue: number

  @column()
  declare percentageValue: number

  @column()
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Employee, {
    foreignKey: 'employeeId',
  })
  declare employee: BelongsTo<typeof Employee>

  @hasMany(() => Sale, {
    foreignKey: 'sellerId',
  })
  declare sales: HasMany<typeof Sale>

  @hasMany(() => SaleItem, {
    foreignKey: 'managerId',
  })
  declare managedSaleItems: HasMany<typeof SaleItem>
}