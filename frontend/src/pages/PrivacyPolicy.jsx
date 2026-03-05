import React from 'react';
import Navbar from '../components/Navbar';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-primary">
            <Navbar />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-gray-900 font-secondary">Privacy Policy</h1>
                            <p className="text-gray-500 mt-2">Last updated: March 2026</p>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-700 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">1. Introduction</h2>
                            <p>
                                Welcome to Shubakar ("we", "our", or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our marketplace website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
                            </p>
                            <p className="mt-2">
                                Shubakar is a platform connecting event planners and couples with trusted vendors, powered by AI to seamlessly help you budget and plan events.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">2. The Data We Collect About You</h2>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li><strong>Identity Data:</strong> includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
                                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                <li><strong>Financial Data:</strong> includes bank account and payment card details (processed securely via our payment partners).</li>
                                <li><strong>Event Data:</strong> includes event dates, guest lists, budget details, locations, and chat interactions with our AI Planner.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">3. How We Use Your Personal Data</h2>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 mt-4 space-y-2">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., matching you with a vendor).</li>
                                <li>To power our AI Planner feature in order to generate customized budget breakdowns and recommendations for your events.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal obligation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">4. Data Security</h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-secondary">5. Contact Details</h2>
                            <p>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at:
                            </p>
                            <ul className="mt-2 font-medium">
                                <li>Email: kudhanshaik04@gmail.com</li>
                                <li>Phone: +91 6304400979</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
