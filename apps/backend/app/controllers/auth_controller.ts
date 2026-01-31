import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Employee from '#models/employee'
import Company from '#models/company'
import { registerValidator, loginValidator, changePasswordValidator } from '#validators/auth_validator'

export default class AuthController {
    async register({ request, response, auth }: HttpContext) {
        const payload = await registerValidator.validate(request.all())
        const { name, email, password, companyName, companyDocument } = payload

        try {
            const existingUser = await User.findBy('email', email)
            if (existingUser) {
                return response.conflict({ message: 'Usuário com este email já existe' })
            }

            const existingCompany = await Company.findBy('document', companyDocument)
            if (existingCompany) {
                return response.conflict({ message: 'Empresa com este CNPJ já está cadastrada' })
            }

            const company = await Company.create({
                name: companyName,
                document: companyDocument,
            })

            const user = await User.create({
                name,
                email,
                password,
                companyId: company.id,
                mustChangePassword: false,
            })

            await auth.use('web').login(user)

            return response.created({
                message: 'Empresa e usuário criados com sucesso!',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    companyId: user.companyId,
                },
                company: {
                    id: company.id,
                    name: company.name,
                },
            })
        } catch (error) {
            return response.badRequest({ message: 'Falha ao registrar empresa e usuário', error })
        }
    }

    async login({ request, response, auth }: HttpContext) {
        const payload = await loginValidator.validate(request.all())
        const { email, password } = payload

        try {
            const user = await User.verifyCredentials(email, password)

            const employee = await Employee.query()
                .where('user_id', user.id)
                .first()

            if (employee && !employee.isActive) {
                return response.forbidden({
                    message: 'Sua conta está inativa. Entre em contato com o administrador.'
                })
            }

            await auth.use('web').login(user)
            await user.load('company')

            return response.ok({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mustChangePassword: user.mustChangePassword,
                    companyId: user.companyId,
                },
                company: {
                    id: user.company.id,
                    name: user.company.name,
                },
            })
        } catch (error) {
            return response.unauthorized({ message: 'Invalid credentials' })
        }
    }

    async logout({ response, auth }: HttpContext) {
        try {
            await auth.use('web').logout()
            return response.ok({ message: 'Logout successful' })
        } catch (error) {
            return response.badRequest({ message: 'Failed to logout', error })
        }
    }

    async me({ response, auth }: HttpContext) {
        try {
            const user = auth.use('web').user

            if (!user) {
                return response.unauthorized({ message: 'Not authenticated' })
            }

            await user.load('company')

            return response.ok({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    mustChangePassword: user.mustChangePassword,
                    companyId: user.companyId,
                },
                company: {
                    id: user.company.id,
                    name: user.company.name,
                },
            })
        } catch (error) {
            return response.unauthorized({ message: 'Not authenticated' })
        }
    }

    async changePassword({ request, response, auth }: HttpContext) {
        const payload = await changePasswordValidator.validate(request.all())
        const { current_password, new_password } = payload

        try {
            const user = auth.use('web').user

            if (!user) {
                return response.unauthorized({ message: 'Not authenticated' })
            }

            const isValidPassword = await User.verifyCredentials(user.email, current_password)
            if (!isValidPassword) {
                return response.unauthorized({ message: 'Senha atual incorreta' })
            }

            user.password = new_password
            user.mustChangePassword = false
            await user.save()

            return response.ok({
                message: 'Senha alterada com sucesso',
            })
        } catch (error) {
            return response.badRequest({ message: 'Failed to change password', error })
        }
    }
}
