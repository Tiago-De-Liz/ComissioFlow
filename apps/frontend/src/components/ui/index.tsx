import React from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    children,
    style,
    ...props
}) => {
    const baseStyles: CSSProperties = {
        padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '0.75rem 1.5rem' : '0.625rem 1.25rem',
        fontSize: size === 'sm' ? '0.875rem' : '1rem',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontWeight: '500',
        opacity: props.disabled ? '0.5' : '1',
    }

    const variants: Record<string, CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: 'white',
        },
        secondary: {
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
        },
        danger: {
            background: 'var(--error)',
            color: 'white',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px solid transparent',
        },
    }

    return (
        <button
            style={{ ...baseStyles, ...variants[variant], ...style }}
            {...props}
            onMouseEnter={(e) => {
                if (!props.disabled) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {children}
        </button>
    )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input: React.FC<InputProps> = ({ label, error, style, type, ...props }) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type

    return (
        <div style={{ width: '100%' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</label>}
            <div style={{ position: 'relative', width: '100%' }}>
                <input
                    type={inputType}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        paddingRight: isPasswordField ? '3rem' : '1rem',
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text)',
                        fontSize: '1rem',
                        outline: 'none',
                        ...style,
                    }}
                    {...props}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--primary)'
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border)'
                    }}
                />
                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                        }}
                        title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--error)' }}>{error}</span>}
        </div>
    )
}

interface CardProps {
    children: ReactNode
    style?: CSSProperties
    className?: string
}

export const Card: React.FC<CardProps> = ({ children, style, className }) => {
    return (
        <div
            className={className}
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                ...style,
            }}
        >
            {children}
        </div>
    )
}

interface Column<T> {
    key: string
    header: string
    render?: (item: T) => ReactNode
}

interface TableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
}

export function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    textAlign: 'left',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'var(--text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            style={{ borderBottom: '1px solid var(--border)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-hover)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        color: 'var(--text)',
                                    }}
                                >
                                    {col.render ? col.render(item) : String((item as any)[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                    Nenhum registro encontrado
                </div>
            )}
        </div>
    )
}

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    const mouseDownTargetRef = React.useRef<EventTarget | null>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownTargetRef.current = e.target
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
            onClose()
        }
        mouseDownTargetRef.current = null
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: 'var(--spacing-lg)',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div
                className="glass fade-in"
                style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    maxWidth: '600px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary'
}) => {
    if (!isOpen) return null

    const mouseDownTargetRef = React.useRef<EventTarget | null>(null)

    const handleMouseDown = (e: React.MouseEvent) => {
        mouseDownTargetRef.current = e.target
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
            onClose()
        }
        mouseDownTargetRef.current = null
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                padding: 'var(--spacing-lg)',
            }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div
                className="glass fade-in"
                style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    maxWidth: '400px',
                    width: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)', lineHeight: '1.5' }}>{message}</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
                        {cancelText}
                    </Button>
                    <Button variant={variant} onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1 }}>
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}
