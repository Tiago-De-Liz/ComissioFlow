import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne, HasMany } from '@adonisjs/lucid/types/relations'
import Position from './position.js'
import Seller from './seller.js'
import Sale from './sale.js'
import User from './user.js'
import Company from './company.js'

export default class Employee extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare document: string

  @column()
  declare positionId: string

  @column()
  declare userId: string | null

  @column()
  declare email: string | null

  @column()
  declare isActive: boolean

  @column()
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Position, {
    foreignKey: 'positionId',
  })
  declare position: BelongsTo<typeof Position>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @hasOne(() => Seller, {
    foreignKey: 'employeeId',
  })
  declare seller: HasOne<typeof Seller>

  @hasMany(() => Sale, {
    foreignKey: 'employeeId',
  })
  declare sales: HasMany<typeof Sale>
}