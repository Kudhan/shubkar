import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/api';
import Spinner from '../components/ui/Spinner';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('Password reset link sent to your email! Check your inbox (and spam folder).');
      setSubmitted(true);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 font-secondary">Forgot Password?</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!submitted ? (
            <>
              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary hover:from-brand-secondary/90 hover:to-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Spinner size={20} className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link <Send className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={onClose}
                  className="font-medium text-brand-secondary hover:text-brand-primary transition-colors"
                >
                  Sign in
                </button>
              </p>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-secondary">Check your email</h3>
              <p className="text-gray-600 mb-8">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
