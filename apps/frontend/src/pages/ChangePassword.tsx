import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/client'
import { Card, Button, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

const ChangePassword: React.FC = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.new_password !== formData.confirm_password) {
            toast.error('As senhas não coincidem')
            return
        }

        if (formData.new_password.length < 8) {
            toast.error('A senha deve ter no mínimo 8 caracteres')
            return
        }

        setLoading(true)
        try {
            await apiClient.post('/api/auth/change-password', {
                current_password: formData.current_password,
                new_password: formData.new_password
            })
            toast.success('Senha alterada com sucesso!')

            setTimeout(() => {
                navigate('/')
                window.location.reload()
            }, 1500)
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao alterar senha'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg)',
            padding: 'var(--spacing-lg)'
        }}>
            <Card style={{ maxWidth: '28rem', width: '100%' }}>
                <div style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                        Troca de Senha Obrigatória
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Por segurança, você deve alterar sua senha temporária antes de continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        label="Senha Atual"
                        type="password"
                        value={formData.current_password}
                        onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                        required
                        placeholder="Digite sua senha temporária"
                    />

                    <Input
                        label="Nova Senha"
                        type="password"
                        value={formData.new_password}
                        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                        required
                        placeholder="Mínimo 8 caracteres"
                    />

                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        required
                        placeholder="Digite novamente"
                    />

                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <strong>Requisitos da senha:</strong>
                        <ul style={{ marginTop: 'var(--spacing-xs)', paddingLeft: 'var(--spacing-lg)' }}>
                            <li>Mínimo de 8 caracteres</li>
                            <li>Pelo menos 1 letra maiúscula</li>
                            <li>Pelo menos 1 letra minúscula</li>
                            <li>Pelo menos 1 número</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleLogout}>
                            Sair
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default ChangePassword
