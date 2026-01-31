import React, { useEffect, useState } from 'react'
import apiClient from '../api/client'
import { Card } from '../components/ui'

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        employees: 0,
        sellers: 0,
        sales: 0,
        totalCommission: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [employeesRes, sellersRes, salesRes] = await Promise.all([
                    apiClient.get('/api/employees'),
                    apiClient.get('/api/sellers'),
                    apiClient.get('/api/sales'),
                ])

                let totalCommission = 0
                for (const sale of salesRes.data) {
                    if (sale.items) {
                        for (const item of sale.items) {
                            totalCommission += (Number(item.sellerCommissionValue) || 0) + (Number(item.managerCommissionValue) || 0)
                        }
                    }
                }

                setStats({
                    employees: employeesRes.data.length,
                    sellers: sellersRes.data.length,
                    sales: salesRes.data.length,
                    totalCommission,
                })
            } catch (error) {
                console.error('Erro ao carregar estatísticas:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    const statCards = [
        { label: 'Funcionários', value: stats.employees, icon: '👥', color: 'var(--primary)' },
        { label: 'Vendedores', value: stats.sellers, icon: '💼', color: 'var(--secondary)' },
        { label: 'Vendas', value: stats.sales, icon: '💰', color: 'var(--success)' },
        {
            label: 'Comissões Totais',
            value: `R$ ${stats.totalCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: '📊',
            color: 'var(--accent)',
        },
    ]

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>Carregando...</div>
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-lg)' }}>
                Dashboard
            </h1>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)',
                }}
            >
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        className="fade-in"
                        style={{
                            animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>
                                    {stat.label}
                                </p>
                                <p style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>
                                    {stat.value}
                                </p>
                            </div>
                            <div style={{ fontSize: '3rem', opacity: 0.2 }}>
                                {stat.icon}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Bem-vindo ao ComissioFlow
                </h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Sistema de gestão de comissões de vendas. Use o menu lateral para navegar entre as funcionalidades:
                </p>
                <ul style={{ marginTop: 'var(--spacing-md)', paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                    <li><strong>Cargos:</strong> Gerencie a hierarquia organizacional</li>
                    <li><strong>Funcionários:</strong> Cadastre e gerencie funcionários</li>
                    <li><strong>Vendedores:</strong> Configure regras de comissão</li>
                    <li><strong>Vendas:</strong> Registre vendas e visualize comissões</li>
                </ul>
            </Card>
        </div>
    )
}

export default Dashboard
