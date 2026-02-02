import React, { useMemo } from 'react';
import BudgetOverviewCards from './BudgetOverviewCards';
import BudgetCharts from './BudgetCharts';
import ExpenseTable from './ExpenseTable';

const BudgetDash = ({ eventData }) => {

    const budgetData = useMemo(() => {
        if (!eventData) return null;

        const totalBudget = eventData.budget?.total || 0;
        const committed = eventData.budget?.committed || 0;

        // Transform bookings into expenses format expected by children
        const expenses = (eventData.bookings || []).map(booking => {
            const amount = booking.finalPrice || booking.price || 0;
            const isPaid = booking.paymentStatus === 'paid';

            return {
                id: booking._id,
                category: booking.serviceType,
                vendor: booking.vendor?.companyName || 'Unknown Vendor',
                estimated: (booking.status === 'confirmed' || booking.status === 'completed') ? 0 : amount,
                final: (booking.status === 'confirmed' || booking.status === 'completed') ? amount : 0,
                paid: isPaid ? amount : 0,
                status: isPaid ? 'paid' : (booking.status === 'confirmed' || booking.status === 'completed') ? 'pending' : 'estimated',
                date: booking.date
            };
        });

        // Add "Other Expenses" placeholder if committed > bookings sum? 
        // For now, let's just stick to bookings as expenses.

        // Aggregate expenses by category for charts
        const categoryMap = {};
        expenses.forEach(exp => {
            if (!categoryMap[exp.category]) {
                categoryMap[exp.category] = {
                    name: exp.category,
                    allocated: 0,
                    spent: 0,
                    color: '#6366f1' // Default color
                };
            }
            // allocated is either final price (if confirmed) or estimated price
            const amount = exp.final > 0 ? exp.final : exp.estimated;
            categoryMap[exp.category].allocated += amount;
            categoryMap[exp.category].spent += exp.paid;
        });

        // Convert map to array and assign specific colors
        const predefinedColors = {
            'Venue': '#8b5cf6', // Violet
            'Catering': '#ec4899', // Pink
            'Photography': '#f59e0b', // Amber
            'Decoration': '#10b981', // Emerald
            'Entertainment': '#3b82f6', // Blue
            'Transportation': '#6366f1', // Indigo
            'Other': '#9ca3af' // Gray
        };

        const categories = Object.values(categoryMap).map(cat => ({
            ...cat,
            color: predefinedColors[cat.name] || '#6366f1'
        }));

        // If no categories yet (no bookings), maybe add placeholders or just empty
        // But to prevent reduce error if array is empty, the reduce in BudgetCharts needs initial value 0 which it has.
        // However, if categories property is missing, that's the error. Now it's present.

        return {
            totalBudget,
            spent: committed,
            currency: 'INR',
            expenses,
            categories
        };
    }, [eventData]);

    if (!eventData) {
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
