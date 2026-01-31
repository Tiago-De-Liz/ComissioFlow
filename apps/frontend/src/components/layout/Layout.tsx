import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Layout: React.FC = () => {
    const { user, logout } = useAuth()
    const location = useLocation()

    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/positions', label: 'Cargos', icon: '👔' },
        { path: '/employees', label: 'Funcionários', icon: '👥' },
        { path: '/sellers', label: 'Vendedores', icon: '💼' },
        { path: '/sales', label: 'Vendas', icon: '💰' },
        { path: '/reports', label: 'Relatórios', icon: '📈' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside
                className="glass slide-in"
                style={{
                    width: '250px',
                    background: 'var(--bg-surface)',
                    borderRight: '1px solid var(--border)',
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ComissioFlow
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Gestão de Comissões
                    </p>
                </div>

                <nav style={{ flex: 1 }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                color: isActive(item.path) ? 'var(--primary)' : 'var(--text-secondary)',
                                background: isActive(item.path) ? 'var(--bg-elevated)' : 'transparent',
                                marginBottom: 'var(--spacing-xs)',
                                fontWeight: isActive(item.path) ? '600' : '400',
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'var(--bg-hover)'
                                    e.currentTarget.style.color = 'var(--text)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive(item.path)) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div style={{ paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Usuário</p>
                        <p style={{ fontSize: '1rem', fontWeight: '500' }}>{user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%',
                            padding: 'var(--spacing-sm)',
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--error)'
                            e.currentTarget.style.borderColor = 'var(--error)'
                            e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                    >
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto' }}>
                <div className="container fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
