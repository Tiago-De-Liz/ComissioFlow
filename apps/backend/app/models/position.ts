import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Employee from './employee.js'
import Company from './company.js'

export default class Position extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare parentPositionId: string | null

  @column()
  declare companyId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>

  @belongsTo(() => Position, {
    foreignKey: 'parentPositionId',
  })
  declare parentPosition: BelongsTo<typeof Position>

  @hasMany(() => Position, {
    foreignKey: 'parentPositionId',
  })
  declare childPositions: HasMany<typeof Position>

  @hasMany(() => Employee, {
    foreignKey: 'positionId',
  })
  declare employees: HasMany<typeof Employee>
}