import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import { Button, Input, Card } from '../../components/ui'
import { validateCNPJ, maskCNPJ, unmask } from '../../utils/validators'

const Register: React.FC = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        companyDocument: '',
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskCNPJ(e.target.value)
        setFormData({ ...formData, companyDocument: unmask(masked) })
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name || formData.name.length < 3) {
            newErrors.name = 'Nome deve ter no mínimo 3 caracteres'
        }

        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.password || formData.password.length < 8) {
            newErrors.password = 'Senha deve ter no mínimo 8 caracteres'
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Senha deve conter maiúscula, minúscula e número'
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem'
        }

        if (!formData.companyName || formData.companyName.length < 3) {
            newErrors.companyName = 'Nome da empresa deve ter no mínimo 3 caracteres'
        }

        if (!formData.companyDocument || !validateCNPJ(formData.companyDocument)) {
            newErrors.companyDocument = 'CNPJ inválido. Verifique os dígitos.'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Por favor, corrija os erros no formulário')
            return
        }

        setLoading(true)

        try {
            await apiClient.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                companyName: formData.companyName,
                companyDocument: formData.companyDocument,
            })

            toast.success('Empresa e usuário criados com sucesso!')
            navigate('/')
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao criar conta'
            toast.error(errorMessage)
            console.error('Registration error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-base)',
            padding: 'var(--spacing-lg)',
        }}>
            <Card style={{ maxWidth: '500px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        ComissioFlow
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Crie sua conta e comece a gerenciar comissões
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>Dados da Empresa</h2>
                    </div>

                    <Input
                        label="Nome da Empresa"
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        error={errors.companyName}
                        placeholder="Empresa Ltda"
                    />

                    <Input
                        label="CNPJ"
                        type="text"
                        value={maskCNPJ(formData.companyDocument)}
                        onChange={handleCNPJChange}
                        required
                        error={errors.companyDocument}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                    />

                    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>Dados do Administrador</h2>
                    </div>

                    <Input
                        label="Nome Completo"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        error={errors.name}
                        placeholder="João Silva"
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        error={errors.email}
                        placeholder="joao@empresa.com"
                    />

                    <Input
                        label="Senha"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        error={errors.password}
                        placeholder="Mínimo 8 caracteres"
                    />

                    <Input
                        label="Confirmar Senha"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        error={errors.confirmPassword}
                        placeholder="Digite a senha novamente"
                    />

                    <div style={{ padding: 'var(--spacing-sm)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-sm)' }}>
                        A senha deve conter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números.
                    </div>

                    <Button type="submit" disabled={loading} style={{ marginTop: 'var(--spacing-md)' }}>
                        {loading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Já tem uma conta?{' '}
                            <a
                                href="/login"
                                style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}
                                onClick={(e) => {
                                    e.preventDefault()
                                    navigate('/login')
                                }}
                            >
                                Fazer login
                            </a>
                        </span>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default Register
