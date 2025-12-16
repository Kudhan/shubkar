import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, Search, MessageSquare } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check auth state on mount and when location changes (simplified auth check)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const NavLink = ({ to, children, icon: Icon }) => (
        <Link
            to={to}
            className="flex items-center text-gray-700 hover:text-brand-primary font-medium transition-colors"
            onClick={() => setIsOpen(false)}
        >
            {Icon && <Icon size={18} className="mr-2" />}
            {children}
        </Link>
    );

    const renderLinks = () => {
        if (!user) {
            return (
                <>
                    <NavLink to="/vendors" icon={Search}>Find Vendors</NavLink>
                    <NavLink to="/ai-planner" icon={LayoutDashboard}>AI Planner</NavLink>
                    <Link to="/vendor/register" className="text-brand-secondary font-semibold hover:text-brand-primary transition-colors">
                        Become a Vendor
                    </Link>
                    <Link to="/login" className="text-gray-700 font-semibold hover:text-brand-primary transition-colors">
                        Sign In
                    </Link>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-brand-primary text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5"
                    >
                        Get Started
                    </button>
                </>
            );
        }

        if (user.role === 'admin' || user.role === 'superadmin') {
            return (
                <>
                    {/* Admin Panel hidden - Access via direct URL or Auto-redirect */}
                    <button onClick={handleLogout} className="flex items-center text-red-600 font-medium hover:text-red-700">
                        <LogOut size={18} className="mr-2" /> Logout
                    </button>
                </>
            );
        }

        if (user.role === 'vendor') {
            return (
                <>
                    <NavLink to="/vendor/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                    <NavLink to="/vendor/dashboard" icon={MessageSquare}>Messages</NavLink>

                    <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                        <span className="text-sm font-medium text-gray-600 hidden md:block">{user.name}</span>
                        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </>
            );
        }

        // Customer Links
        return (
            <>
                <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
                <NavLink to="/timeline" icon={Calendar}>Timeline</NavLink>
                <NavLink to="/vendors" icon={Search}>Vendors</NavLink>
                <NavLink to="/ai-planner" icon={LayoutDashboard}>AI Planner</NavLink>

                <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                    <span className="text-sm font-medium text-gray-600 hidden md:block">{user.name}</span>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </>
        );
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group">
                        <div className="mr-2 bg-gradient-to-tr from-brand-primary to-brand-secondary p-1.5 rounded-lg text-white transform group-hover:rotate-12 transition-transform shadow-md">
                            <span className="text-xl">✨</span>
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent font-secondary">
                            SHUBAKAR
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {renderLinks()}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-brand-primary">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 animate-fade-in shadow-xl">
                    <div className="px-4 pt-2 pb-6 space-y-3 flex flex-col">
                        {renderLinks()}
                        {/* Mobile Logout explicit button if logged in */}
                        {user && (
                            <button onClick={handleLogout} className="flex items-center text-red-600 font-medium py-2">
                                <LogOut size={18} className="mr-2" /> Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
