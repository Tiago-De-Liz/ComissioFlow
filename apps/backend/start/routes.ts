/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')
const PositionsController = () => import('#controllers/positions_controller')
const EmployeesController = () => import('#controllers/employees_controller')
const SellersController = () => import('#controllers/sellers_controller')
const SalesController = () => import('#controllers/sales_controller')
const SaleItemsController = () => import('#controllers/sale_items_controller')
const ReportsController = () => import('#controllers/reports_controller')

// Health check
router.get('/', async () => ({ status: 'ok', message: 'ComissioFlow API is running' }))

// Authentication routes (public)
router
    .group(() => {
        router.post('/register', [AuthController, 'register'])
        router.post('/login', [AuthController, 'login']).use(middleware.throttle())
        router.post('/logout', [AuthController, 'logout'])
        router.get('/me', [AuthController, 'me']).use(middleware.auth())
        router.post('/change-password', [AuthController, 'changePassword']).use(middleware.auth())
    })
    .prefix('/api/auth')

// Protected API routes
router
    .group(() => {
        // Users
        router.resource('users', UsersController).apiOnly()

        // Positions
        router.get('/positions/hierarchy', [PositionsController, 'hierarchy'])
        router.resource('positions', PositionsController).apiOnly()

        // Employees
        router.get('/employees/by-user', [EmployeesController, 'byUser'])
        router.patch('/employees/:id/toggle-active', [EmployeesController, 'toggleActive'])
        router.post('/employees/:id/reset-password', [EmployeesController, 'resetPassword'])
        router.post('/employees/:id/create-user-access', [EmployeesController, 'createUserAccess'])
        router.resource('employees', EmployeesController).apiOnly()

        // Sellers
        router.get('/sellers/by-employee/:employeeId', [SellersController, 'byEmployee'])
        router.resource('sellers', SellersController).apiOnly()

        // Sales
        router.get('/sales/:id/commission-summary', [SalesController, 'commissionSummary'])
        router.resource('sales', SalesController).apiOnly()

        // Sale Items
        router.resource('sale-items', SaleItemsController).apiOnly()

        // Reports
        router.get('/reports/commissions', [ReportsController, 'commissions'])
        router.get('/reports/commissions/pdf', [ReportsController, 'commissionsPdf'])
    })
    .prefix('/api')
    .use(middleware.auth())
