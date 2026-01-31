import React, { useState, useEffect } from 'react';
import BudgetOverviewCards from './BudgetOverviewCards';
import BudgetCharts from './BudgetCharts';
import ExpenseTable from './ExpenseTable';
import { mockBudgetData } from './BudgetMockData';

const BudgetDash = ({ eventId }) => {
    // In a real app, we would fetch budget data for the specific eventId here.
    // For now, we use the mock data.
    const [budgetData, setBudgetData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setBudgetData(mockBudgetData);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [eventId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-40 bg-gray-100 rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-80 bg-gray-100 rounded-2xl"></div>
                    <div className="h-80 bg-gray-100 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!budgetData) return <div>No budget data available.</div>;

    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* Overview Cards */}
            <BudgetOverviewCards data={budgetData} />

            {/* Charts Section */}
            <BudgetCharts data={budgetData} />

            {/* Expense Table */}
            <ExpenseTable expenses={budgetData.expenses} currency={budgetData.currency} />

        </div>
    );
};

export default BudgetDash;
