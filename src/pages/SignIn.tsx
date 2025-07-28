import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, Mail, Lock } from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'donor' | 'recipient' | 'volunteer'>('donor');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    if (verified === 'true') {
      toast({
        title: 'Email Verified!',
        description: 'Please sign in.',
      });
      setMode('signin');
    } else if (error) {
      toast({
        title: 'Error',
        description: 'Verification failed. Please try again.',
        variant: 'destructive',
      });
    }
  }, [location.search, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast({
          title: 'Welcome!',
          description: 'Successfully signed in.',
        });
        navigate('/');
      } else {
        await signUp(email, password, { full_name: fullName, phone, user_type: userType });
        toast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
        });
        setMode('signin');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <div className="relative h-64 mb-8 rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070"
              alt="Community volunteers"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-600/80 to-transparent" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {mode === 'signin' ? 'Welcome Back!' : 'Join Our Community!'}
            <br />
            <span className="text-green-600">Make a Difference Today</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {mode === 'signin'
              ? 'Sign in to continue your volunteering journey.'
              : 'Sign up to start helping South African communities.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          {mode === 'signup' && (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Your Full Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="Your Phone Number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <select
                    id="userType"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="donor">Donor</option>
                    <option value="recipient">Recipient</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            <Target className="w-5 h-5 ml-2" />
          </Button>
          <Button
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            variant="outline"
            className="w-full text-green-600 hover:text-green-700"
          >
            {mode === 'signin' ? 'Switch to Sign Up' : 'Switch to Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;