import React from 'react';

const BudgetCharts = ({ data }) => {
    const { categories, currency } = data;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Prepare data for Pie Chart (CSS Conic Gradient)
    const totalAllocated = categories.reduce((acc, cat) => acc + cat.allocated, 0);
    let cumulativePercent = 0;
    const gradientSegments = categories.map(cat => {
        const percent = (cat.allocated / totalAllocated) * 100;
        const start = cumulativePercent;
        cumulativePercent += percent;
        return `${cat.color} ${start}% ${cumulativePercent}%`;
    }).join(', ');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Spending Distribution (Pie Chart) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Spending Distribution</h3>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* CSS Pie Chart */}
                    <div
                        className="w-48 h-48 rounded-full shadow-inner relative flex-shrink-0"
                        style={{ background: `conic-gradient(${gradientSegments})` }}
                    >
                        <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-medium">By Category</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                <div>
                                    <p className="text-xs text-gray-500">{cat.name}</p>
                                    <p className="text-sm font-bold text-gray-900">{Math.round((cat.allocated / totalAllocated) * 100)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Planned vs Actual (Bar Chart) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Planned vs Actual</h3>
                <div className="space-y-4">
                    {categories.slice(0, 4).map((cat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{cat.name}</span>
                                <span className="text-gray-500 ml-2">
                                    {formatCurrency(cat.spent)} / <span className="text-gray-400">{formatCurrency(cat.allocated)}</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 relative">
                                {/* Allocated marker (background) is the full width, we show spent as progress */}
                                <div
                                    className="absolute top-0 left-0 h-2.5 rounded-full"
                                    style={{
                                        width: `${Math.min((cat.spent / cat.allocated) * 100, 100)}%`,
                                        backgroundColor: cat.color
                                    }}
                                ></div>
                                {/* Overspend indicator if needed */}
                                {cat.spent > cat.allocated && (
                                    <div
                                        className="absolute top-0 left-0 h-2.5 rounded-full bg-red-500 opacity-50 animate-pulse"
                                        style={{
                                            width: `${Math.min((cat.spent / cat.allocated) * 100, 100)}%`
                                        }}
                                    ></div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BudgetCharts;
