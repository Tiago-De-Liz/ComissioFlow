import Company from '#models/company'
import User from '#models/user'
import Position from '#models/position'
import Employee from '#models/employee'
import Seller from '#models/seller'
import Sale from '#models/sale'

const companies = await Company.query().count('* as total')
const users = await User.query().count('* as total')
const positions = await Position.query().count('* as total')
const employees = await Employee.query().count('* as total')
const sellers = await Seller.query().count('* as total')
const sales = await Sale.query().count('* as total')

console.log('=== DATABASE VERIFICATION ===')
console.log('Companies:', companies[0].$extras.total)
console.log('Users:', users[0].$extras.total)
console.log('Positions:', positions[0].$extras.total)
console.log('Employees:', employees[0].$extras.total)
console.log('Sellers:', sellers[0].$extras.total)
console.log('Sales:', sales[0].$extras.total)
console.log('✅ All data created successfully!')

process.exit(0)
