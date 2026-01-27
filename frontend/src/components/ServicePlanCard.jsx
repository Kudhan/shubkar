import React from 'react';
import { Package, CheckCircle2, Info } from 'lucide-react';

const ServicePlanCard = ({ plan, onBook, isSelected }) => {
    return (
        <div
            className={`relative p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${isSelected
                    ? 'border-brand-primary bg-brand-primary/5 shadow-md ring-1 ring-brand-primary'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            onClick={() => onBook(plan)}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{plan.description}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                    <Package size={20} className="text-gray-400" />
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</span>
                    {plan.pricingModel === 'PER_UNIT' && (
                        <span className="text-gray-500 text-sm font-medium">/ {plan.unitType}</span>
                    )}
                </div>
                {plan.pricingModel === 'PER_UNIT' && (
                    <p className="text-xs text-gray-400 mt-1">
                        Min: {plan.minQuantity} {plan.maxQuantity ? `• Max: ${plan.maxQuantity}` : ''}
                    </p>
                )}
            </div>

            <div className="space-y-3 mb-6">
                {plan.includedItems && plan.includedItems.length > 0 ? (
                    plan.includedItems.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle2 size={16} className="text-green-500 mr-2 mt-0.5 shrink-0" />
                            <span>{item}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-gray-400 italic">No specific items listed</div>
                )}
                {plan.includedItems && plan.includedItems.length > 4 && (
                    <div className="text-xs text-brand-primary font-medium pl-6">
                        + {plan.includedItems.length - 4} more
                    </div>
                )}
            </div>

            <button
                className={`w-full py-3 rounded-xl font-bold transition-colors ${isSelected
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
            >
                {isSelected ? 'Selected' : 'Select Plan'}
            </button>

            {plan.addOns && plan.addOns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500">
                    <Info size={14} className="mr-1.5" />
                    {plan.addOns.length} Optional Add-ons Available
                </div>
            )}
        </div>
    );
};

export default ServicePlanCard;
