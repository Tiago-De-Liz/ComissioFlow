import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import User from '#models/user'
import { isValidCPF } from '#utils/cpf_validator'

export default class EmployeesController {
    async index({ request, response, auth }: HttpContext) {
        const user = auth.use('web').user!
        const isActive = request.input('is_active')
        const positionId = request.input('position_id')

        const query = Employee.query()
            .where('company_id', user.companyId)
            .preload('position')
            .preload('seller')

        if (isActive !== undefined) {
            query.where('is_active', isActive === 'true' || isActive === true)
        }

        if (positionId) {
            query.where('position_id', positionId)
        }

        const employees = await query.exec()
        return response.ok(employees)
    }

    async show({ params, response, auth }: HttpContext) {
        try {
            const user = auth.use('web').user!
            const employee = await Employee.query()
                .where('id', params.id)
                .where('company_id', user.companyId)
                .preload('position')
                .preload('seller')
                .preload('sales')
                .firstOrFail()

            return response.ok(employee)
        } catch (error) {
            return response.notFound({ message: 'Employee not found' })
        }
    }

    async store({ request, response, auth }: HttpContext) {
        const currentUser = auth.use('web').user!
        const data = request.only(['name', 'document', 'positionId', 'isActive', 'email'])
        const createUserAccount = request.input('createUserAccount')
        const password = request.input('password')

        try {
            if (data.document && !isValidCPF(data.document)) {
                return response.badRequest({ message: 'CPF inválido' })
            }

            let userId: string | null = null

            if (createUserAccount && data.email && password) {
                const existingUser = await User.findBy('email', data.email)
                if (existingUser) {
                    return response.conflict({ message: 'Este email já está em uso' })
                }

                const user = await User.create({
                    name: data.name,
                    email: data.email,
                    password: password,
                    mustChangePassword: true,
                    companyId: currentUser.companyId,
                })
                userId = user.id
            }

            const employee = await Employee.create({
                ...data,
                userId,
                companyId: currentUser.companyId,
            })
            await employee.load('position')
            if (userId) {
                await employee.load('user')
            }

            return response.created(employee)
        } catch (error) {
            return response.badRequest({ message: 'Failed to create employee', error })
        }
    }

    async update({ params, request, response, auth }: HttpContext) {
        try {
            const currentUser = auth.use('web').user!
            const employee = await Employee.query()
                .where('id', params.id)
                .where('company_id', currentUser.companyId)
                .firstOrFail()
            const data = request.only(['name', 'document', 'positionId', 'isActive', 'email'])

            if (data.document && !isValidCPF(data.document)) {
                return response.badRequest({ message: 'CPF inválido' })
            }

            if (employee.userId && data.email && data.email !== employee.email) {
                const user = await User.findOrFail(employee.userId)

                const existingUser = await User.query()
                    .where('email', data.email)
                    .whereNot('id', user.id)
                    .first()

                if (existingUser) {
                    return response.conflict({ message: 'Este email já está em uso' })
                }

                user.email = data.email
                await user.save()
            }

            employee.merge(data)
            await employee.save()
            await employee.load('position')

            return response.ok(employee)
        } catch (error) {
            return response.badRequest({ message: 'Failed to update employee', error })
        }
    }

    async destroy({ params, response }: HttpContext) {
        try {
            const employee = await Employee.findOrFail(params.id)

            if (employee.userId) {
                const user = await User.find(employee.userId)
                if (user) {
                    await user.delete()
                }
            }

            await employee.delete()

            return response.noContent()
        } catch (error) {
            return response.badRequest({ message: 'Failed to delete employee', error })
        }
    }

    async toggleActive({ params, response }: HttpContext) {
        try {
            const employee = await Employee.findOrFail(params.id)
            employee.isActive = !employee.isActive
            await employee.save()

            return response.ok(employee)
        } catch (error) {
            return response.badRequest({ message: 'Failed to toggle employee status', error })
        }
    }

    async byUser({ auth, response }: HttpContext) {
        try {
            const user = auth.use('web').user

            if (!user) {
                return response.unauthorized({ message: 'Not authenticated' })
            }

            const employee = await Employee.query()
                .where('user_id', user.id)
                .preload('position')
                .preload('seller')
                .first()

            if (!employee) {
                return response.notFound({ message: 'Employee not found for this user' })
            }

            return response.ok(employee)
        } catch (error) {
            return response.badRequest({ message: 'Failed to get employee', error })
        }
    }

    async resetPassword({ params, request, response }: HttpContext) {
        try {
            const employee = await Employee.findOrFail(params.id)

            if (!employee.userId) {
                return response.badRequest({
                    message: 'Este funcionário não tem conta de usuário vinculada'
                })
            }

            const user = await User.findOrFail(employee.userId)

            const { password } = request.only(['password'])
            const tempPassword = password || `Temp${Math.floor(1000 + Math.random() * 9000)}@`

            user.password = tempPassword
            user.mustChangePassword = true
            await user.save()

            return response.ok({
                message: 'Senha resetada com sucesso',
                temporaryPassword: tempPassword,
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to reset password', error })
        }
    }

    async createUserAccess({ params, request, response }: HttpContext) {
        try {
            const employee = await Employee.findOrFail(params.id)

            if (employee.userId) {
                return response.badRequest({
                    message: 'Este funcionário já possui conta de usuário vinculada'
                })
            }

            const { email, password } = request.only(['email', 'password'])

            if (!email || !password) {
                return response.badRequest({
                    message: 'Email e senha são obrigatórios'
                })
            }

            const existingUser = await User.findBy('email', email)
            if (existingUser) {
                return response.conflict({ message: 'Este email já está em uso' })
            }

            const user = await User.create({
                name: employee.name,
                email: email,
                password: password,
                mustChangePassword: true,
            })

            employee.userId = user.id
            employee.email = email
            await employee.save()

            await employee.load('position')
            await employee.load('seller')

            return response.ok({
                message: 'Acesso ao sistema criado com sucesso',
                employee,
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to create user access', error })
        }
    }
}
