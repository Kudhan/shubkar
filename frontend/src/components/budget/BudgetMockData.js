
export const mockBudgetData = {
    totalBudget: 1500000,
    spent: 850000,
    currency: 'INR',
    categories: [
        { name: 'Venue', allocated: 500000, spent: 450000, color: '#6366f1' },
        { name: 'Catering', allocated: 400000, spent: 300000, color: '#ec4899' },
        { name: 'Photography', allocated: 150000, spent: 100000, color: '#8b5cf6' },
        { name: 'Decoration', allocated: 200000, spent: 0, color: '#10b981' },
        { name: 'Attire', allocated: 150000, spent: 0, color: '#f59e0b' },
        { name: 'Music', allocated: 100000, spent: 0, color: '#3b82f6' }
    ],
    expenses: [
        { id: 1, vendor: 'Grand Palace Hotel', category: 'Venue', estimated: 500000, final: 450000, paid: 200000, status: 'partial', date: '2024-02-15' },
        { id: 2, vendor: 'Tasty Bites Catering', category: 'Catering', estimated: 400000, final: 400000, paid: 100000, status: 'partial', date: '2024-02-20' },
        { id: 3, vendor: 'Click Moments', category: 'Photography', estimated: 150000, final: 150000, paid: 150000, status: 'paid', date: '2024-01-10' },
        { id: 4, vendor: 'Dream Decor', category: 'Decoration', estimated: 200000, final: 0, paid: 0, status: 'pending', date: '2024-03-01' },
    ]
};
