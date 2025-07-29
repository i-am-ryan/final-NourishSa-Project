import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Lock, Mail, IdCard, Flag, Eye, EyeOff } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identification, setIdentification] = useState('');
  const [isSouthAfrican, setIsSouthAfrican] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => password.length >= 6;

  const validateIdentification = (id: string, isSA: boolean) => {
    if (!id) return true; // Optional for sign-in
    if (isSA) return /^\d{13}$/.test(id); // South African ID: 13 digits
    return id.length >= 6; // Basic passport length check
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isIdValid = isSignUp ? validateIdentification(identification, isSouthAfrican) : true;

    if (!isEmailValid) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email (e.g., example@email.com).',
        variant: 'destructive',
      });
      return;
    }
    if (!isPasswordValid) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    if (isSignUp && !isIdValid) {
      toast({
        title: 'Invalid Identification',
        description: `Please enter a valid ${isSouthAfrican ? 'South African ID (13 digits, e.g., 1234567890123)' : 'passport number (at least 6 characters, e.g., AB123456)'}.`,
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password, { full_name: email.split('@')[0] }, identification, isSouthAfrican);
        toast({
          title: 'Sign Up Successful! 🎉',
          description: 'Check your email to verify your account. 📧',
        });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({
          title: 'Sign In Successful! 🌟',
          description: 'Welcome back! 🚀',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Try again. 😞',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-pink-100 flex flex-col items-center">
      {/* Banner Image */}
      <div className="w-full bg-gradient-to-r from-teal-500 to-purple-500 text-white text-center py-6">
        <h1 className="text-4xl font-bold">Welcome to NourishSA! 🌱</h1>
        <p className="text-lg mt-2">Join our community to fight food waste and make a difference! ✨</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg mt-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {isSignUp ? 'Sign Up 🌱' : 'Sign In ✨'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email 📧</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., example@email.com"
                className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password 🔒</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g., MyPass123"
                className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="identification" className="text-gray-700">
                  {isSouthAfrican ? 'ID Number 🇿🇦' : 'Passport Number 🌍'} 🆔
                </Label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="identification"
                    type="text"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    placeholder={isSouthAfrican ? 'e.g., 1234567890123' : 'e.g., AB123456'}
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isSouthAfrican"
                  checked={isSouthAfrican}
                  onChange={(e) => setIsSouthAfrican(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <Label htmlFor="isSouthAfrican" className="text-gray-700">South African? 🇿🇦</Label>
              </div>
            </>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white transition-all duration-200"
            disabled={!email || !password || (isSignUp && !identification)}
          >
            {isSignUp ? 'Sign Up 🚀' : 'Sign In 🌟'}
          </Button>
          <p className="text-center text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'} ✨
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default SignIn;