import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input, Button, Card } from '../components/ui'

const SignIn: React.FC = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, hsl(262, 83%, 20%) 0%, hsl(220, 70%, 20%) 50%, hsl(240, 10%, 4%) 100%)',
                padding: 'var(--spacing-lg)',
            }}
        >
            <Card style={{ maxWidth: '420px', width: '100%' }} className="fade-in glass">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h1
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 'var(--spacing-sm)',
                        }}
                    >
                        ComissioFlow
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Faça login para continuar</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <Input
                        type="email"
                        label="Email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />

                    <Input
                        type="password"
                        label="Senha"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <div
                            style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)',
                                fontSize: '0.875rem',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            Não tem uma conta?{' '}
                            <a
                                href="/register"
                                style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}
                            >
                                Criar conta
                            </a>
                        </span>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'rgba(139, 92, 246, 0.05)', borderRadius: 'var(--radius-md)' }}>
                        <p>Usuário padrão: admin@comissioflow.com</p>
                        <p>Senha: Admin@123</p>
                    </div>
                </form>
            </Card>
        </div>
    )
}

export default SignIn
