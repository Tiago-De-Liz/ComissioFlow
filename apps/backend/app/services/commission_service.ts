import Seller from '#models/seller'
import Employee from '#models/employee'

interface CommissionCalculation {
    fixedValue: number
    percentageValue: number
    totalValue: number
    rule: string
}

interface CommissionResult {
    sellerCommission: CommissionCalculation
    managerCommission: CommissionCalculation | null
    managerId: string | null
}

export default class CommissionService {
    async calculate(sellerId: string, itemValue: number): Promise<CommissionResult> {
        const seller = await Seller.query()
            .where('id', sellerId)
            .preload('employee', (query) => {
                query.preload('position')
            })
            .firstOrFail()

        const sellerCommission = this.calculateCommission(
            seller.fixedValue,
            seller.percentageValue,
            itemValue
        )

        let managerCommission: CommissionCalculation | null = null
        let managerId: string | null = null

        const managerSeller = await this.findManagerSeller(seller.employee)
        if (managerSeller) {
            managerId = managerSeller.id
            managerCommission = this.calculateCommission(
                managerSeller.fixedValue,
                managerSeller.percentageValue,
                itemValue
            )
        }

        return {
            sellerCommission,
            managerCommission,
            managerId,
        }
    }

    private calculateCommission(
        fixedValue: number,
        percentageValue: number,
        itemValue: number
    ): CommissionCalculation {
        const fixed = Number(fixedValue) || 0
        const percentageVal = Number(percentageValue) || 0

        const percentageAmount = Number(itemValue) * (percentageVal / 100)
        const total = fixed + percentageAmount

        let rule = `Total de comissão: R$ ${total.toFixed(2)}. (`

        if (fixed > 0) {
            rule += `R$ ${fixed.toFixed(2)} por veículo vendido.`
        }

        if (percentageAmount > 0) {
            rule += ` ${percentageVal.toFixed(2)}% do valor da venda (R$ ${percentageAmount.toFixed(2)})`
        }

        rule += ')'

        return {
            fixedValue: fixed,
            percentageValue: percentageAmount,
            totalValue: total,
            rule,
        }
    }

    private async findManagerSeller(employee: Employee): Promise<Seller | null> {
        await employee.load('position', (query) => {
            query.preload('parentPosition')
        })

        const managerPosition = employee.position.parentPosition
        if (!managerPosition) {
            return null
        }

        const managerEmployee = await Employee.query()
            .where('position_id', managerPosition.id)
            .where('is_active', true)
            .first()

        if (!managerEmployee) {
            return null
        }

        const managerSeller = await Seller.query()
            .where('employee_id', managerEmployee.id)
            .first()

        return managerSeller
    }
}
