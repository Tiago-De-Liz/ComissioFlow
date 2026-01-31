export interface Company {
    id: string
    name: string
}

export interface User {
    id: string
    name: string
    email: string
    mustChangePassword?: boolean
    companyId?: string
}

export interface Position {
    id: string
    name: string
    parentPositionId: string | null
    createdAt: string
    updatedAt: string
    parentPosition?: Position
    childPositions?: Position[]
    employees?: Employee[]
}

export interface Employee {
    id: string
    name: string
    document: string
    positionId: string
    userId?: string | null
    email?: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    position?: Position
    seller?: Seller
    sales?: Sale[]
}

export interface Seller {
    id: string
    employeeId: string
    fixedValue: number
    percentageValue: number
    createdAt: string
    updatedAt: string
    employee?: Employee
    sales?: Sale[]
}

export interface Sale {
    id: string
    sellerId: string
    saleDate: string
    createdAt: string
    updatedAt: string
    seller?: Seller
    items?: SaleItem[]
}

export interface SaleItem {
    id: string
    saleId: string
    description: string
    value: number
    sellerCommissionValue: number
    sellerCommissionRule: string | null
    managerId: string | null
    managerCommissionValue: number
    managerCommissionRule: string | null
    createdAt: string
    updatedAt: string
    sale?: Sale
    manager?: Seller
}

export interface CommissionSummary {
    saleId: string
    totalSellerCommission: number
    totalManagerCommission: number
    totalCommission: number
    items: {
        id: string
        description: string
        value: number
        sellerCommission: number
        sellerRule: string | null
        managerCommission: number
        managerRule: string | null
    }[]
}

export interface CommissionReport {
    period: {
        start: string | null
        end: string | null
    }
    sellers: {
        sellerId: string
        sellerName: string
        totalSales: number
        sellerCommissionTotal: number
        managerCommissionTotal: number
        commissionTotal: number
    }[]
    grandTotal: {
        sales: number
        sellerCommissions: number
        managerCommissions: number
        total: number
    }
}

export interface AuthContextType {
    user: User | null
    company: Company | null
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    loading: boolean
}
