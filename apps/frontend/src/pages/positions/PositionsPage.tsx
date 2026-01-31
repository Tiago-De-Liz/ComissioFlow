import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import type { Position } from '../../types'
import { Card, Button, Table, Modal, Input, ConfirmModal } from '../../components/ui'

const PositionsPage: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPosition, setEditingPosition] = useState<Position | null>(null)
    const [formData, setFormData] = useState({ name: '', parentPositionId: '' })
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} })

    useEffect(() => {
        fetchPositions()
    }, [])

    const fetchPositions = async () => {
        try {
            const res = await apiClient.get('/api/positions?hierarchy=true')
            setPositions(res.data)
        } catch (error) {
            toast.error('Erro ao carregar cargos')
            console.error('Erro ao carregar cargos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPosition) {
                await apiClient.put(`/api/positions/${editingPosition.id}`, {
                    ...formData,
                    parentPositionId: formData.parentPositionId || null,
                })
                toast.success('Cargo atualizado com sucesso!')
            } else {
                await apiClient.post('/api/positions', {
                    ...formData,
                    parentPositionId: formData.parentPositionId || null,
                })
                toast.success('Cargo criado com sucesso!')
            }
            setIsModalOpen(false)
            setFormData({ name: '', parentPositionId: '' })
            setEditingPosition(null)
            fetchPositions()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao salvar cargo'
            toast.error(errorMessage)
            console.error('Erro ao salvar cargo:', error)
        }
    }

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Cargo',
            message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/api/positions/${id}`)
                    toast.success('Cargo excluído com sucesso!')
                    fetchPositions()
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Erro ao excluir cargo'
                    toast.error(errorMessage)
                    console.error('Erro ao excluir cargo:', error)
                }
            }
        })
    }

    const openModal = (position?: Position) => {
        if (position) {
            setEditingPosition(position)
            setFormData({ name: position.name, parentPositionId: position.parentPositionId || '' })
        } else {
            setEditingPosition(null)
            setFormData({ name: '', parentPositionId: '' })
        }
        setIsModalOpen(true)
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Cargos</h1>
                <Button onClick={() => openModal()}>+ Novo Cargo</Button>
            </div>

            <Card>
                <Table
                    data={positions}
                    columns={[
                        { key: 'name', header: 'Nome' },
                        {
                            key: 'parentPosition',
                            header: 'Cargo Superior',
                            render: (p: Position) => p.parentPosition?.name || '-',
                        },
                        {
                            key: 'actions',
                            header: 'Ações',
                            render: (p: Position) => (
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <Button size="sm" variant="secondary" onClick={() => openModal(p)}>
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(p.id, p.name)}>
                                        Excluir
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    keyExtractor={(p) => p.id}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPosition ? 'Editar Cargo' : 'Novo Cargo'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        label="Nome do Cargo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Cargo Superior (opcional)
                        </label>
                        <select
                            value={formData.parentPositionId}
                            onChange={(e) => setFormData({ ...formData, parentPositionId: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text)',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="">Nenhum</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" style={{ flex: 1 }}>
                            {editingPosition ? 'Atualizar' : 'Criar'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                            Cancelar
                        </Button>
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

export default PositionsPage
