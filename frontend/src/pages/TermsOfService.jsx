import React from 'react';
import Navbar from '../components/Navbar';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 font-secondary">Terms of Service</h1>
                            <p className="text-gray-500 mt-2">Effective Date: March 2026</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using the Shubakar platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">2. Description of Service</h2>
                            <p>
                                Shubakar provides an online marketplace and AI-assisted planning tool designed primarily for events such as weddings, corporate functions, and parties. Our platform connects event hosts ("Customers") with third-party service providers ("Vendors"). 
                            </p>
                            <p className="mt-2">
                                While our AI tools provide budgeting estimates and recommendations, they do not guarantee exact market pricing. Shubakar is an intermediary and is not responsible for the performance, quality, or final delivery of services booked through third-party Vendors.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">3. User Accounts</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You must provide accurate, complete, and current information when registering an account.</li>
                                <li>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.</li>
                                <li>We reserve the right to suspend or terminate accounts that breach these Terms or engage in fraudulent activity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">4. Vendor Obligations</h2>
                            <p>
                                Vendors registered on Shubakar agree to maintain accurate availability, pricing, and service descriptions. Vendors are responsible for addressing customer requests in a timely manner and fulfilling accepted bookings with professionalism. Shubakar reserves the right to remove any Vendor who consistently receives negative feedback or violates our community guidelines.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">5. Limitation of Liability</h2>
                            <p>
                                In no event shall Shubakar, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">6. Changes to Terms</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any major changes on our website.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
