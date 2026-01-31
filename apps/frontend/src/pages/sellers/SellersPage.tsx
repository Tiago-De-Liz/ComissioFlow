import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import type { Seller, Employee } from '../../types'
import { Card, Button, Table, Modal, Input, ConfirmModal } from '../../components/ui'

const SellersPage: React.FC = () => {
    const [sellers, setSellers] = useState<Seller[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
    const [formData, setFormData] = useState({ employeeId: '', fixedValue: '', percentageValue: '' })
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [sellersRes, employeesRes] = await Promise.all([
                apiClient.get('/api/sellers'),
                apiClient.get('/api/employees'),
            ])
            setSellers(sellersRes.data)
            setEmployees(employeesRes.data)
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
                employeeId: formData.employeeId,
                fixedValue: parseFloat(formData.fixedValue),
                percentageValue: parseFloat(formData.percentageValue),
            }
            if (editingSeller) {
                await apiClient.put(`/api/sellers/${editingSeller.id}`, data)
                toast.success('Vendedor atualizado com sucesso!')
            } else {
                await apiClient.post('/api/sellers', data)
                toast.success('Vendedor criado com sucesso!')
            }
            setIsModalOpen(false)
            setFormData({ employeeId: '', fixedValue: '', percentageValue: '' })
            setEditingSeller(null)
            fetchData()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao salvar vendedor'
            toast.error(errorMessage)
            console.error('Erro:', error)
        }
    }

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Vendedor',
            message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/api/sellers/${id}`)
                    toast.success('Vendedor excluído com sucesso!')
                    fetchData()
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Erro ao excluir vendedor'
                    toast.error(errorMessage)
                    console.error('Erro:', error)
                }
            }
        })
    }

    const openModal = (seller?: Seller) => {
        if (seller) {
            setEditingSeller(seller)
            setFormData({
                employeeId: seller.employeeId,
                fixedValue: seller.fixedValue.toString(),
                percentageValue: seller.percentageValue.toString(),
            })
        } else {
            setEditingSeller(null)
            setFormData({ employeeId: '', fixedValue: '', percentageValue: '' })
        }
        setIsModalOpen(true)
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Vendedores</h1>
                <Button onClick={() => openModal()}>+ Novo Vendedor</Button>
            </div>

            <Card>
                <Table
                    data={sellers}
                    columns={[
                        {
                            key: 'employee',
                            header: 'Funcionário',
                            render: (s: Seller) => s.employee?.name || '-',
                        },
                        {
                            key: 'fixedValue',
                            header: 'Valor Fixo',
                            render: (s: Seller) => `R$ ${(Number(s.fixedValue) || 0).toFixed(2)}`,
                        },
                        {
                            key: 'percentageValue',
                            header: 'Percentual',
                            render: (s: Seller) => `${(Number(s.percentageValue) || 0).toFixed(2)}%`,
                        },
                        {
                            key: 'actions',
                            header: 'Ações',
                            render: (s: Seller) => (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="secondary" onClick={() => openModal(s)}>Editar</Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(s.id, s.employee?.name || 'Vendedor')}>Excluir</Button>
                                </div>
                            ),
                        },
                    ]}
                    keyExtractor={(s) => s.id}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Funcionário</label>
                        <select
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            required
                            disabled={!!editingSeller}
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)', fontSize: '1rem' }}
                        >
                            <option value="">Selecione...</option>
                            {employees.map((e) => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Valor Fixo (R$)" type="number" step="0.01" value={formData.fixedValue} onChange={(e) => setFormData({ ...formData, fixedValue: e.target.value })} required />
                    <Input label="Percentual (%)" type="number" step="0.01" value={formData.percentageValue} onChange={(e) => setFormData({ ...formData, percentageValue: e.target.value })} required />
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" style={{ flex: 1 }}>{editingSeller ? 'Atualizar' : 'Criar'}</Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
                    </div>
                </form>
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

export default SellersPage
