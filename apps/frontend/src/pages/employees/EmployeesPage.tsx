import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../../api/client'
import type { Employee, Position } from '../../types'
import { Card, Button, Table, Modal, Input, ConfirmModal } from '../../components/ui'
import { validateCPF, maskCPF as maskCPFUtil, unmask } from '../../utils/validators'

const EmployeesPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [positions, setPositions] = useState<Position[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
    const [showCreateAccess, setShowCreateAccess] = useState(false)
    const [accessData, setAccessData] = useState({ email: '', password: '' })
    const [formData, setFormData] = useState({
        name: '',
        document: '',
        positionId: '',
        isActive: true,
        email: '',
        createUserAccount: false,
        password: ''
    })

    const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, employeeId: '', employeeName: '' })
    const [resetPasswordData, setResetPasswordData] = useState({ password: '' })
    const [showPasswordModal, setShowPasswordModal] = useState({ isOpen: false, password: '', title: '' })
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} })

    useEffect(() => {
        fetchData()
    }, [])

    const formatCPF = (cpf: string): string => {
        if (!cpf) return '-'
        const cleaned = cpf.replace(/\D/g, '')
        if (cleaned.length !== 11) return cpf
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = maskCPFUtil(e.target.value)
        setFormData({ ...formData, document: unmask(masked) })
    }

    const generateStrongPassword = () => {
        const length = 12
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const lowercase = 'abcdefghijklmnopqrstuvwxyz'
        const numbers = '0123456789'
        const special = '@#$%&*'
        const all = uppercase + lowercase + numbers + special

        let password = ''
        password += uppercase[Math.floor(Math.random() * uppercase.length)]
        password += lowercase[Math.floor(Math.random() * lowercase.length)]
        password += numbers[Math.floor(Math.random() * numbers.length)]
        password += special[Math.floor(Math.random() * special.length)]

        for (let i = password.length; i < length; i++) {
            password += all[Math.floor(Math.random() * all.length)]
        }

        return password.split('').sort(() => Math.random() - 0.5).join('')
    }

    const fetchData = async () => {
        try {
            const [employeesRes, positionsRes] = await Promise.all([
                apiClient.get('/api/employees'),
                apiClient.get('/api/positions'),
            ])
            setEmployees(employeesRes.data)
            setPositions(positionsRes.data)
        } catch (error) {
            toast.error('Erro ao carregar dados')
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateCPF(formData.document)) {
            toast.error('CPF inválido. Verifique os dígitos.')
            return
        }

        try {
            if (editingEmployee) {
                await apiClient.put(`/api/employees/${editingEmployee.id}`, formData)
                toast.success('Funcionário atualizado com sucesso!')
            } else {
                await apiClient.post('/api/employees', formData)
                toast.success(formData.createUserAccount
                    ? 'Funcionário e usuário criados com sucesso!'
                    : 'Funcionário criado com sucesso!')
            }
            setIsModalOpen(false)
            setFormData({ name: '', document: '', positionId: '', isActive: true, email: '', createUserAccount: false, password: '' })
            setEditingEmployee(null)
            fetchData()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao salvar funcionário'
            toast.error(errorMessage)
            console.error('Erro ao salvar funcionário:', error)
        }
    }

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Excluir Funcionário',
            message: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                try {
                    await apiClient.delete(`/api/employees/${id}`)
                    toast.success('Funcionário excluído com sucesso!')
                    fetchData()
                } catch (error) {
                    toast.error('Erro ao excluir funcionário')
                    console.error('Erro ao excluir:', error)
                }
            }
        })
    }

    const toggleActive = async (id: string) => {
        try {
            await apiClient.patch(`/api/employees/${id}/toggle-active`)
            toast.success('Status atualizado com sucesso!')
            fetchData()
        } catch (error) {
            toast.error('Erro ao alterar status')
            console.error('Erro ao alterar status:', error)
        }
    }

    const openResetPasswordModal = (id: string, name: string) => {
        setResetPasswordModal({ isOpen: true, employeeId: id, employeeName: name })
        setResetPasswordData({ password: '' })
    }

    const handleResetPassword = async () => {
        if (!resetPasswordData.password) {
            toast.error('Informe a nova senha temporária')
            return
        }

        try {
            await apiClient.post(`/api/employees/${resetPasswordModal.employeeId}/reset-password`, {
                password: resetPasswordData.password
            })

            setResetPasswordModal({ isOpen: false, employeeId: '', employeeName: '' })
            setShowPasswordModal({
                isOpen: true,
                password: resetPasswordData.password,
                title: 'Senha Resetada com Sucesso'
            })
            setResetPasswordData({ password: '' })
            toast.success('Senha resetada com sucesso!')
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao resetar senha'
            toast.error(errorMessage)
            console.error('Erro ao resetar senha:', error)
        }
    }

    const handleCreateUserAccess = async (id: string) => {
        if (!accessData.email || !accessData.password) {
            toast.error('Email e senha são obrigatórios')
            return
        }

        try {
            await apiClient.post(`/api/employees/${id}/create-user-access`, accessData)
            toast.success('Acesso ao sistema criado com sucesso!')
            setShowCreateAccess(false)
            setAccessData({ email: '', password: '' })
            setIsModalOpen(false)
            fetchData()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Erro ao criar acesso'
            toast.error(errorMessage)
            console.error('Erro ao criar acesso:', error)
        }
    }

    const openModal = (employee?: Employee) => {
        if (employee) {
            console.log('📝 Editing employee:', employee)
            console.log('🔑 Has userId?', employee.userId)
            console.log('📧 Has email?', employee.email)
            setEditingEmployee(employee)
            setFormData({
                name: employee.name,
                document: employee.document,
                positionId: employee.positionId,
                isActive: employee.isActive,
                email: employee.email || '',
                createUserAccount: false,
                password: ''
            })
        } else {
            setEditingEmployee(null)
            setFormData({ name: '', document: '', positionId: '', isActive: true, email: '', createUserAccount: false, password: '' })
        }
        setShowCreateAccess(false)
        setAccessData({ email: '', password: '' })
        setIsModalOpen(true)
    }

    if (loading) return <div>Carregando...</div>

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Funcionários</h1>
                <Button onClick={() => openModal()}>+ Novo Funcionário</Button>
            </div>

            <Card>
                <Table
                    data={employees}
                    columns={[
                        { key: 'name', header: 'Nome' },
                        {
                            key: 'document',
                            header: 'Documento',
                            render: (e: Employee) => formatCPF(e.document),
                        },
                        {
                            key: 'position',
                            header: 'Cargo',
                            render: (e: Employee) => e.position?.name || '-',
                        },
                        {
                            key: 'email',
                            header: 'Email',
                            render: (e: Employee) => e.email || '-',
                        },
                        {
                            key: 'isActive',
                            header: 'Status',
                            render: (e: Employee) => (
                                <span
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.875rem',
                                        background: e.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: e.isActive ? 'var(--success)' : 'var(--error)',
                                    }}
                                >
                                    {e.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                            ),
                        },
                        {
                            key: 'actions',
                            header: 'Ações',
                            render: (e: Employee) => (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Button size="sm" variant="secondary" onClick={() => openModal(e)}>
                                        Editar
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => toggleActive(e.id)}>
                                        {e.isActive ? 'Desativar' : 'Ativar'}
                                    </Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(e.id, e.name)}>
                                        Excluir
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    keyExtractor={(e) => e.id}
                />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input label="Nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <Input
                        label="CPF"
                        value={maskCPFUtil(formData.document)}
                        onChange={handleCPFChange}
                        required
                        placeholder="000.000.000-00"
                        maxLength={14}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cargo</label>
                        <select
                            value={formData.positionId}
                            onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)', fontSize: '1rem' }}
                        >
                            <option value="">Selecione...</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {editingEmployee && (
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: 'var(--spacing-sm)', color: 'var(--text)' }}>
                                Acesso ao Sistema
                            </h3>
                            {editingEmployee.userId ? (
                                <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                    <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                                        <Input
                                            label="Email vinculado"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => openResetPasswordModal(editingEmployee.id, editingEmployee.name)}
                                        style={{ marginTop: 'var(--spacing-sm)' }}
                                    >
                                        🔑 Resetar Senha
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    {!showCreateAccess ? (
                                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                                ❌ Este funcionário não possui acesso ao sistema
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setShowCreateAccess(true)}
                                            >
                                                ➕ Criar Acesso ao Sistema
                                            </Button>
                                        </div>
                                    ) : (
                                        <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                            <Input
                                                label="Email"
                                                type="email"
                                                value={accessData.email}
                                                onChange={(e) => setAccessData({ ...accessData, email: e.target.value })}
                                                required
                                                placeholder="email@example.com"
                                                style={{ marginBottom: 'var(--spacing-sm)' }}
                                            />
                                            <Input
                                                label="Senha Temporária"
                                                type="password"
                                                value={accessData.password}
                                                onChange={(e) => setAccessData({ ...accessData, password: e.target.value })}
                                                required
                                                placeholder="Mínimo 8 caracteres"
                                                style={{ marginBottom: 'var(--spacing-sm)' }}
                                            />
                                            <div style={{ padding: 'var(--spacing-sm)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                                ℹ️ O funcionário será obrigado a trocar a senha no primeiro login.
                                            </div>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleCreateUserAccess(editingEmployee.id)}
                                                    style={{ flex: 1 }}
                                                >
                                                    ✅ Criar Acesso
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setShowCreateAccess(false)
                                                        setAccessData({ email: '', password: '' })
                                                    }}
                                                    style={{ flex: 1 }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!editingEmployee && (
                        <>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.createUserAccount}
                                        onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Criar acesso ao sistema</span>
                                </label>
                            </div>

                            {formData.createUserAccount && (
                                <>
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        placeholder="email@example.com"
                                    />
                                    <Input
                                        label="Senha Temporária"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <div style={{ padding: 'var(--spacing-sm)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        ℹ️ O funcionário será obrigado a trocar a senha no primeiro login.
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" style={{ flex: 1 }}>{editingEmployee ? 'Atualizar' : 'Criar'}</Button>
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Cancelar</Button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={resetPasswordModal.isOpen}
                onClose={() => setResetPasswordModal({ isOpen: false, employeeId: '', employeeName: '' })}
                title={`Resetar Senha - ${resetPasswordModal.employeeName}`}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <Input
                        label="Nova Senha Temporária"
                        type="password"
                        value={resetPasswordData.password}
                        onChange={(e) => setResetPasswordData({ password: e.target.value })}
                        placeholder="Digite a senha ou clique em Gerar"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setResetPasswordData({ password: generateStrongPassword() })}
                    >
                        🎲 Gerar Senha Forte
                    </Button>
                    <div style={{ padding: 'var(--spacing-sm)', background: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        ℹ️ O funcionário será obrigado a trocar a senha no primeiro login.
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <Button onClick={handleResetPassword} style={{ flex: 1 }}>
                            Resetar Senha
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setResetPasswordModal({ isOpen: false, employeeId: '', employeeName: '' })}
                            style={{ flex: 1 }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Show Password Modal */}
            <Modal
                isOpen={showPasswordModal.isOpen}
                onClose={() => setShowPasswordModal({ isOpen: false, password: '', title: '' })}
                title={showPasswordModal.title}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ padding: 'var(--spacing-lg)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                            Senha Temporária:
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '600', fontFamily: 'monospace', color: 'var(--text)', wordBreak: 'break-all' }}>
                            {showPasswordModal.password}
                        </p>
                    </div>
                    <div style={{ padding: 'var(--spacing-sm)', background: 'rgba(255, 152, 0, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        ⚠️ Anote esta senha e forneça ao funcionário. Ele será obrigado a trocar no primeiro login.
                    </div>
                    <Button onClick={() => setShowPasswordModal({ isOpen: false, password: '', title: '' })}>
                        Entendi
                    </Button>
                </div>
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

export default EmployeesPage
