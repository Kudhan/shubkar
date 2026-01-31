import React, { useState } from 'react';
import { Filter, Download, MoreVertical, Edit2, Trash2, CheckCircle } from 'lucide-react';

const ExpenseTable = ({ expenses, currency }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'partial': return 'bg-amber-100 text-amber-700';
            case 'pending': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-gray-900 text-lg">Vendor Expenses</h3>

                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full sm:w-64 pl-4 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Filter size={18} />
                    </button>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Download size={18} />
                    </button>
                    <button className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-primary/90 transition-colors">
                        + Add Expense
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-sm">
                            <th className="p-4 font-medium pl-6">Vendor</th>
                            <th className="p-4 font-medium">Category</th>
                            <th className="p-4 font-medium">Est. Cost</th>
                            <th className="p-4 font-medium">Final Cost</th>
                            <th className="p-4 font-medium">Paid</th>
                            <th className="p-4 font-medium">Due</th>
                            <th className="p-4 font-medium text-center">Status</th>
                            <th className="p-4 font-medium text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredExpenses.map((expense) => {
                            const due = expense.final > 0 ? expense.final - expense.paid : expense.estimated - expense.paid;

                            return (
                                <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 pl-6 font-semibold text-gray-900">{expense.vendor}</td>
                                    <td className="p-4 text-gray-500">{expense.category}</td>
                                    <td className="p-4 text-gray-500">{formatCurrency(expense.estimated)}</td>
                                    <td className="p-4 font-medium text-gray-900">
                                        {expense.final > 0 ? formatCurrency(expense.final) : '-'}
                                    </td>
                                    <td className="p-4 text-green-600">{formatCurrency(expense.paid)}</td>
                                    <td className="p-4 font-bold text-gray-900">{formatCurrency(due)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getStatusColor(expense.status)}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredExpenses.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No expenses found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpenseTable;
