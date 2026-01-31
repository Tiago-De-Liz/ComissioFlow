import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import type { Sale, Seller, CommissionSummary } from '../../types'
import { Card, Button, Table, Modal, Input, ConfirmModal } from '../../components/ui'

const SalesPage: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([])
    const [sellers, setSellers] = useState<Seller[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [commissionModal, setCommissionModal] = useState<{ isOpen: boolean; data: CommissionSummary | null }>({ isOpen: false, data: null })
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} })
    const [formData, setFormData] = useState({
        sellerId: '',
        saleDate: new Date().toISOString().split('T')[0],
        items: [{ description: '', value: '' }],
    })

    useEffect(() => {
        fetchData()
        fetchCurrentUserEmployee()
    }, [])

    const fetchCurrentUserEmployee = async () => {
        try {
            const res = await apiClient.get('/api/employees/by-user')
            if (res.data.seller) {
                setFormData(prev => ({ ...prev, sellerId: res.data.seller.id }))
            }
        } catch (error) {
            console.log('User does not have an employee profile')
        }
    }

    const fetchData = async () => {
        try {
            const [salesRes, sellersRes] = await Promise.all([
                apiClient.get('/api/sales'),
                apiClient.get('/api/sellers'),
            ])
            setSales(salesRes.data)
            setSellers(sellersRes.data)
        } catch (error) {
            toast.error('Erro ao carregar dados')
            console.error('Erro:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const data = {
                ...formData,
                items: formData.items.map((item) => ({
                    description: item.description,
                    value: parseFloat(item.value),
                })),
            }
            await apiClient.post('/api/sales', data)
            toast.success('Venda criada com sucesso!')
            setIsModalOpen(false)
            setFormData({
                sellerId: '',
                saleDate: new Date().toISOString().split('T')[0],
                items: [{ description: '', value: '' }],
            })
            fetchData()
        } catch (error) {
            toast.error('Erro ao criar venda')
            console.error('Erro:', error)
        }
    }

    const viewCommission = async (saleId: string) => {
        try {
            const res = await apiClient.get(`/api/sales/${saleId}/commission-summary`)
            setCommissionModal({ isOpen: true, data: res.data })
        } catch (error) {
            toast.error('Erro ao carregar comissões')
            console.error('Erro:', error)
        }
    }

    const handleDelete = (id: string, sellerName: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Venda',
            message: `Tem certeza que deseja excluir a venda de "${sellerName}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/api/sales/${id}`)
                    toast.success('Venda excluída com sucesso!')
                    fetchData()
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Erro ao excluir venda'
                    toast.error(errorMessage)
                    console.error('Erro:', error)
                }
            }
        })
    }

    const addItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', value: '' }] })
    }

    const removeItem = (index: number) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
    }

    const updateItem = (index: number, field: 'description' | 'value', value: string) => {
        const newItems = [...formData.items]
        newItems[index][field] = value
        setFormData({ ...formData, items: newItems })
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Vendas</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Nova Venda</Button>
            </div>

            <Card>
                <Table
                    data={sales}
                    columns={[
                        {
                            key: 'saleDate',
                            header: 'Data',
                            render: (s: Sale) => new Date(s.saleDate).toLocaleDateString('pt-BR'),
                        },
                        {
                            key: 'seller',
                            header: 'Vendedor',
                            render: (s: Sale) => s.seller?.employee?.name || '-',
                        },
                        {
                            key: 'items',
                            header: 'Itens',
                            render: (s: Sale) => s.items?.length || 0,
                        },
                        {
                            key: 'total',
                            header: 'Total',
                            render: (s: Sale) => {
                                const total = s.items?.reduce((acc, item) => acc + (Number(item.value) || 0), 0) || 0
                                return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            },
                        },
                        {
                            key: 'actions',
                            header: 'Ações',
                            render: (s: Sale) => (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="secondary" onClick={() => viewCommission(s.id)}>Ver Comissões</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.id, s.seller?.employee?.name || 'Vendedor')}>Excluir</Button>
                                </div>
                            ),
                        },
                    ]}
                    keyExtractor={(s) => s.id}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Venda">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vendedor</label>
                        <select value={formData.sellerId} onChange={(e) => setFormData({ ...formData, sellerId: e.target.value })} required style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)', fontSize: '1rem' }}>
                            <option value="">Selecione...</option>
                            {sellers.map((s) => (
                                <option key={s.id} value={s.id}>{s.employee?.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Data da Venda" type="date" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} required />

                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Itens da Venda</label>
                            <Button type="button" size="sm" onClick={addItem}>+ Adicionar Item</Button>
                        </div>
                        {formData.items.map((item, index) => (
                            <div key={index} style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <Input placeholder="Descrição" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} required style={{ flex: 2 }} />
                                <Input placeholder="Valor" type="number" step="0.01" value={item.value} onChange={(e) => updateItem(index, 'value', e.target.value)} required style={{ flex: 1 }} />
                                {formData.items.length > 1 && (
                                    <Button type="button" size="sm" variant="danger" onClick={() => removeItem(index)}>×</Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" style={{ flex: 1 }}>Criar Venda</Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={commissionModal.isOpen} onClose={() => setCommissionModal({ isOpen: false, data: null })} title="Detalhes das Comissões">
                {commissionModal.data && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Comissão Vendedor</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>R$ {(Number(commissionModal.data.totalSellerCommission) || 0).toFixed(2)}</p>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--secondary)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Comissão Gerente</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>R$ {(Number(commissionModal.data.totalManagerCommission) || 0).toFixed(2)}</p>
                            </div>
                            <div style={{ padding: 'var(--spacing-md)', background: 'rgba(236, 72, 153, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent)' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>R$ {(Number(commissionModal.data.totalCommission) || 0).toFixed(2)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Itens</h3>
                            {commissionModal.data.items.map((item) => (
                                <div key={item.id} style={{ padding: 'var(--spacing-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)' }}>
                                    <p style={{ fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>{item.description}</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Valor: R$ {(Number(item.value) || 0).toFixed(2)}</p>
                                    <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
                                        <p>• Vendedor: R$ {(Number(item.sellerCommission) || 0).toFixed(2)} ({item.sellerRule})</p>
                                        {(Number(item.managerCommission) || 0) > 0 && (
                                            <p>• Gerente: R$ {(Number(item.managerCommission) || 0).toFixed(2)} ({item.managerRule})</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                variant="danger"
                confirmText="Excluir"
            />
        </div>
    )
}

export default SalesPage
