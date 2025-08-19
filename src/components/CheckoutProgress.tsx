'use client';

import React from 'react';

interface CheckoutProgressProps {
  currentStep: 1 | 2;
}

export default function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const steps = [
    { id: 1, name: 'Shipping', description: 'Delivery information' },
    { id: 2, name: 'Payment', description: 'Payment & review' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.id
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <i className="fas fa-check text-sm"></i>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </div>
                <div className="text-xs text-gray-400">{step.description}</div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 px-4 pb-8">
                <div
                  className={`h-0.5 ${
                    currentStep > step.id ? 'bg-black' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}