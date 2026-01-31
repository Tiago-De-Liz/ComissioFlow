import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import type { CommissionReport, Seller } from '../../types'
import { Card, Button, Table, Input } from '../../components/ui'

const ReportsPage: React.FC = () => {
    const [report, setReport] = useState<CommissionReport | null>(null)
    const [sellers, setSellers] = useState<Seller[]>([])
    const [loading, setLoading] = useState(false)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        sellerId: '',
    })

    useEffect(() => {
        fetchSellers()
    }, [])

    const fetchSellers = async () => {
        try {
            const res = await apiClient.get('/api/sellers')
            setSellers(res.data)
        } catch (error) {
            console.error('Erro ao carregar vendedores:', error)
        }
    }

    const generateReport = async (e?: React.FormEvent) => {
        e?.preventDefault()
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.startDate) params.append('start_date', filters.startDate)
            if (filters.endDate) params.append('end_date', filters.endDate)
            if (filters.sellerId) params.append('seller_id', filters.sellerId)

            const res = await apiClient.get(`/api/reports/commissions?${params.toString()}`)
            setReport(res.data)
        } catch (error) {
            console.error('Erro ao gerar relatório:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', sellerId: '' })
        setReport(null)
    }

    const exportPDF = async () => {
        try {
            const params = new URLSearchParams()
            if (filters.startDate) params.append('start_date', filters.startDate)
            if (filters.endDate) params.append('end_date', filters.endDate)
            if (filters.sellerId) params.append('seller_id', filters.sellerId)

            const response = await apiClient.get(`/api/reports/commissions/pdf?${params.toString()}`, {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `relatorio-comissoes-${new Date().toISOString().split('T')[0]}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Erro ao exportar PDF:', error)
            toast.error('Erro ao gerar PDF. Por favor, tente novamente.')
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Relatório de Comissões</h1>
            </div>

            <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>Filtros</h2>
                <form onSubmit={generateReport} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', alignItems: 'end' }}>
                    <Input
                        label="Data Início"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    />
                    <Input
                        label="Data Fim"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vendedor</label>
                        <select
                            value={filters.sellerId}
                            onChange={(e) => setFilters({ ...filters, sellerId: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text)',
                                fontSize: '1rem'
                            }}
                        >
                            <option value="">Todos os vendedores</option>
                            {sellers.map((s) => (
                                <option key={s.id} value={s.id}>{s.employee?.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <Button type="submit" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Gerando...' : 'Gerar Relatório'}
                        </Button>
                        <Button type="button" variant="primary" onClick={exportPDF}>
                            Exportar PDF
                        </Button>
                        <Button type="button" variant="secondary" onClick={clearFilters}>
                            Limpar
                        </Button>
                    </div>
                </form>
            </Card>

            {report && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>Total de Vendas</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{report.grandTotal.sales}</p>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.2 }}>💰</div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>Comissões Vendedores</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary)' }}>
                                        R$ {report.grandTotal.sellerCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.2 }}>💼</div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>Comissões Gerentes</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>
                                        R$ {report.grandTotal.managerCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.2 }}>👥</div>
                            </div>
                        </Card>
                        <Card>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--spacing-xs)' }}>Total Geral</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent)' }}>
                                        R$ {report.grandTotal.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div style={{ fontSize: '2rem', opacity: 0.2 }}>📊</div>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                            Comissões por Vendedor
                            {report.period.start && report.period.end && (
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '400', marginLeft: 'var(--spacing-md)' }}>
                                    ({new Date(report.period.start).toLocaleDateString('pt-BR')} - {new Date(report.period.end).toLocaleDateString('pt-BR')})
                                </span>
                            )}
                        </h2>
                        {report.sellers.length > 0 ? (
                            <Table
                                data={report.sellers}
                                columns={[
                                    {
                                        key: 'sellerName',
                                        header: 'Vendedor',
                                        render: (s) => s.sellerName,
                                    },
                                    {
                                        key: 'totalSales',
                                        header: 'Nº de Vendas',
                                        render: (s) => s.totalSales,
                                    },
                                    {
                                        key: 'sellerCommissionTotal',
                                        header: 'Comissão Vendedor',
                                        render: (s) => `R$ ${s.sellerCommissionTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                    },
                                    {
                                        key: 'managerCommissionTotal',
                                        header: 'Comissão Gerente',
                                        render: (s) => `R$ ${s.managerCommissionTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                    },
                                    {
                                        key: 'commissionTotal',
                                        header: 'Total',
                                        render: (s) => (
                                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                                R$ {s.commissionTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        ),
                                    },
                                ]}
                                keyExtractor={(s) => s.sellerId}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                                Nenhuma comissão encontrada para os filtros selecionados.
                            </div>
                        )}
                    </Card>
                </>
            )}

            {!report && !loading && (
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                        Selecione os filtros e clique em "Gerar Relatório" para visualizar os dados.
                    </div>
                </Card>
            )}
        </div>
    )
}

export default ReportsPage
