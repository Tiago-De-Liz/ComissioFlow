import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sale_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('sale_id').notNullable().references('id').inTable('sales').onDelete('CASCADE')
      table.string('description', 500).notNullable()
      table.decimal('value', 10, 2).notNullable()

      // Seller commission
      table.decimal('seller_commission_value', 10, 2).nullable().defaultTo(0)
      table.text('seller_commission_rule').nullable()

      // Manager commission
      table.uuid('manager_id').nullable().references('id').inTable('sellers').onDelete('SET NULL')
      table.decimal('manager_commission_value', 10, 2).nullable().defaultTo(0)
      table.text('manager_commission_rule').nullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}