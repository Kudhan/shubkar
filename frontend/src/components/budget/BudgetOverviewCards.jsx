import React from 'react';
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';

const BudgetOverviewCards = ({ data }) => {
    const { totalBudget, spent, currency, expenses } = data;
    const remaining = totalBudget - spent;
    const percentUsed = Math.min(Math.round((spent / totalBudget) * 100), 100);

    // Calculate upcoming payments (pending or partial)
    const upcomingPayments = expenses
        .filter(exp => exp.status !== 'paid')
        .reduce((acc, curr) => acc + (curr.final && curr.final > 0 ? curr.final - curr.paid : curr.estimated - curr.paid), 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Budget */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Budget</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</h3>
                    </div>
                    <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary">
                        <DollarSign size={24} />
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div className="bg-brand-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-gray-400">Locked in</p>
            </div>

            {/* Total Spent */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Total Spent</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(spent)}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <CreditCard size={24} />
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${percentUsed}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-400">{percentUsed}% of budget used</p>
            </div>

            {/* Remaining */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Remaining</p>
                        <h3 className={`text-2xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(remaining)}
                        </h3>
                    </div>
                    <div className={`p-3 rounded-xl ${remaining < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        <TrendingUp size={24} />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {remaining < 0 ? 'Over budget!' : 'Available for allocation'}
                </p>
            </div>

            {/* Upcoming Payments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Due Payments</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(upcomingPayments)}</h3>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <AlertCircle size={24} />
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Pending vendor payments
                </p>
            </div>
        </div>
    );
};

export default BudgetOverviewCards;
