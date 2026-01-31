import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Add company_id to users table
    this.schema.alterTable('users', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })

    // Add company_id to employees table
    this.schema.alterTable('employees', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })

    // Add company_id to positions table
    this.schema.alterTable('positions', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })

    // Add company_id to sellers table
    this.schema.alterTable('sellers', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })

    // Add company_id to sales table
    this.schema.alterTable('sales', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })

    // Add company_id to sale_items table
    this.schema.alterTable('sale_items', (table) => {
      table.uuid('company_id').notNullable().references('id').inTable('companies').onDelete('CASCADE')
      table.index('company_id')
    })
  }

  async down() {
    this.schema.alterTable('sale_items', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })

    this.schema.alterTable('sales', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })

    this.schema.alterTable('sellers', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })

    this.schema.alterTable('positions', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })

    this.schema.alterTable('employees', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })

    this.schema.alterTable('users', (table) => {
      table.dropForeign(['company_id'])
      table.dropColumn('company_id')
    })
  }
}
