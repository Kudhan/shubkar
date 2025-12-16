import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, Calendar, Star, ArrowRight, CheckCircle, Heart, Users } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white font-primary">
            <Navbar />

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary/5 text-brand-primary font-semibold text-sm mb-8 animate-fade-in-up">
                        <Star size={16} className="mr-2" />
                        <span>Trusted by 10,000+ Couples & Planners</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 font-secondary animate-fade-in-up delay-100">
                        Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Perfect</span> <br className="hidden md:block" /> Celebration
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 animate-fade-in-up delay-200">
                        From weddings to corporate galas, find the best vendors, manage your budget with AI, and create unforgettable memories.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-300">
                        <Link to="/ai-planner" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-brand-primary hover:bg-brand-primary/90 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                            <Calendar className="mr-2" size={20} />
                            Start Planning AI
                        </Link>
                        <Link to="/vendors" className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-secondary text-lg font-bold rounded-xl text-brand-secondary bg-white hover:bg-brand-secondary hover:text-white transition-all transform hover:-translate-y-1">
                            <Search className="mr-2" size={20} />
                            Find Vendors
                        </Link>
                    </div>
                </div>
            </header>

            {/* Featured Vendors / Categories */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 font-secondary mb-4">Everything You Need</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Discover top-rated vendors across all categories to bring your vision to life.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Venues', icon: '🏰', count: '200+', color: 'bg-purple-100 text-purple-600' },
                            { name: 'Catering', icon: '🍲', count: '150+', color: 'bg-orange-100 text-orange-600' },
                            { name: 'Photography', icon: '📸', count: '120+', color: 'bg-blue-100 text-blue-600' },
                            { name: 'Decoration', icon: '✨', count: '180+', color: 'bg-pink-100 text-pink-600' },
                        ].map((cat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-gray-100">
                                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.name}</h3>
                                <p className="text-sm text-gray-500">{cat.count} Vendors available</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dual CTA Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* For Customers */}
                        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-secondary/90 to-blue-500/90 text-white p-10 lg:p-14 shadow-2xl transform hover:scale-[1.01] transition-transform">
                            <div className="relative z-10">
                                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Heart size={32} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 font-secondary">For Couples & Planners</h3>
                                <p className="text-white/90 mb-8 text-lg">
                                    Access our AI Budget Assistant, create detailed timelines, and book trusted vendors all in one place.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-accent" /> Free AI Planning Tools</li>
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-accent" /> Verified Vendor Reviews</li>
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-accent" /> Secure Chat & Booking</li>
                                </ul>
                                <Link to="/register" className="inline-block bg-white text-brand-secondary font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
                                    Plan My Event
                                </Link>
                            </div>
                        </div>

                        {/* For Vendors */}
                        <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white p-10 lg:p-14 shadow-2xl transform hover:scale-[1.01] transition-transform">
                            <div className="relative z-10">
                                <div className="bg-brand-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Users size={32} className="text-brand-purple" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 font-secondary">For Business Owners</h3>
                                <p className="text-gray-300 mb-8 text-lg">
                                    Grow your event business. Receive targeted leads, manage bookings, and showcase your portfolio to thousands.
                                </p>
                                <ul className="space-y-3 mb-8 text-gray-300">
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-purple" /> Zero Commission on leads</li>
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-purple" /> Direct Customer Chat</li>
                                    <li className="flex items-center"><CheckCircle size={18} className="mr-3 text-brand-purple" /> Analytics Dashboard</li>
                                </ul>
                                <Link to="/vendor/register" className="inline-flex items-center bg-brand-purple text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-purple/90 transition-colors shadow-lg">
                                    Join as Vendor <ArrowRight size={18} className="ml-2" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold text-white font-secondary">SHUBAKAR</span>
                        <p className="mt-4 text-gray-400 max-w-xs">
                            Your trusted partner in creating perfect celebrations. Connecting dreams with reality through technology.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/vendors" className="hover:text-brand-primary">Browse Vendors</Link></li>
                            <li><Link to="/ai-planner" className="hover:text-brand-primary">AI Planner</Link></li>
                            <li><Link to="/login" className="hover:text-brand-primary">Sign In</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-brand-primary">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-brand-primary">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-brand-primary">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
                    &copy; 2024 Shubakar Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Home;
