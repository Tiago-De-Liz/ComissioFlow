import React, { createContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import apiClient from '../api/client'
import type { User, Company, AuthContextType } from '../types'

export const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await apiClient.get('/api/auth/me')
            setUser(response.data.user)
            if (response.data.company) {
                setCompany(response.data.company)
            }
        } catch (error) {
            setUser(null)
            setCompany(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const response = await apiClient.post('/api/auth/login', { email, password })
        setUser(response.data.user)
        if (response.data.company) {
            setCompany(response.data.company)
        }
    }

    const register = async (name: string, email: string, password: string) => {
        const response = await apiClient.post('/api/auth/register', { name, email, password })
        setUser(response.data.user)
        if (response.data.company) {
            setCompany(response.data.company)
        }
    }

    const logout = async () => {
        await apiClient.post('/api/auth/logout')
        setUser(null)
        setCompany(null)
    }

    return (
        <AuthContext.Provider value={{ user, company, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
