
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, CreditCard, FileText } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { validateSAID, validatePassport, validatePhone } from '@/lib/verification';

const SignIn = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idType, setIdType] = useState<'sa_id' | 'passport'>('sa_id');
  const [userType, setUserType] = useState<'donor' | 'volunteer' | 'recipient'>('donor');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const testimonials = [
    {
      text: "NourishSA helped us feed 200 families in our community last month.",
      author: "Sarah Mthembu, Community Leader"
    },
    {
      text: "As a volunteer driver, I see the real impact we make every day.",
      author: "David Chen, Volunteer"
    },
    {
      text: "Our restaurant surplus now helps local families instead of going to waste.",
      author: "Ahmed Hassan, Restaurant Owner"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign In Failed",
            description: error.message || "Please check your credentials and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome Back!",
            description: "You've been successfully signed in.",
          });
          navigate('/');
        }
      } else {
        // Sign up validation
        if (password !== confirmPassword) {
          toast({
            title: "Passwords Don't Match",
            description: "Please make sure your passwords match.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: "Password Too Short",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Validate phone number
        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.isValid) {
          toast({
            title: "Invalid Phone Number",
            description: phoneValidation.error || "Please enter a valid South African phone number.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Validate ID number or passport
        if (idType === 'sa_id') {
          const idValidation = validateSAID(idNumber);
          if (!idValidation.isValid) {
            toast({
              title: "Invalid ID Number",
              description: idValidation.error || "Please enter a valid 13-digit South African ID number.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        } else {
          const passportValidation = validatePassport(idNumber);
          if (!passportValidation.isValid) {
            toast({
              title: "Invalid Passport Number",
              description: passportValidation.error || "Please enter a valid passport number.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        const { error } = await signUp(email, password, {
          full_name: fullName,
          phone: phone,
          id_number: idNumber,
          id_type: idType,
          user_type: userType,
        });

        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message || "Please try again with different credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
          setMode('signin');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setPhone('');
    setIdNumber('');
    setIdType('sa_id');
    setUserType('donor');
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Sign In Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {mode === 'signin' ? 'Welcome Back' : 'Join Our Community'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {mode === 'signin' 
                    ? 'Sign in to continue making a difference in your community'
                    : 'Create an account to start helping your community'
                  }
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {mode === 'signup' && (
                    <>
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10"
                            placeholder="+27 12 345 6789"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Format: +27 12 345 6789 or 012 345 6789</p>
                      </div>

                      <div>
                        <Label htmlFor="idType">Identity Verification</Label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { value: 'sa_id', label: 'SA ID Number', icon: CreditCard },
                            { value: 'passport', label: 'Passport', icon: FileText }
                          ].map((type) => (
                            <Button
                              key={type.value}
                              type="button"
                              variant={idType === type.value ? "default" : "outline"}
                              onClick={() => setIdType(type.value as any)}
                              className="text-xs"
                            >
                              <type.icon className="w-3 h-3 mr-1" />
                              {type.label}
                            </Button>
                          ))}
                        </div>
                        <div className="relative">
                          {idType === 'sa_id' ? (
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          ) : (
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                          )}
                          <Input
                            id="idNumber"
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                            className="pl-10"
                            placeholder={idType === 'sa_id' ? "YYMMDD 0000 000" : "A12345678"}
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {idType === 'sa_id' 
                            ? "13-digit South African ID number (YYMMDD 0000 000)"
                            : "Passport number (e.g., A12345678)"
                          }
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="userType">I want to...</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'donor', label: 'Donate Food' },
                            { value: 'volunteer', label: 'Volunteer' },
                            { value: 'recipient', label: 'Receive Food' }
                          ].map((type) => (
                            <Button
                              key={type.value}
                              type="button"
                              variant={userType === type.value ? "default" : "outline"}
                              onClick={() => setUserType(type.value as any)}
                              className="text-xs"
                            >
                              {type.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        placeholder="••••••••"
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

                  {mode === 'signup' && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'signin' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="keep-signed-in"
                          checked={keepSignedIn}
                          onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
                        />
                        <Label htmlFor="keep-signed-in" className="text-sm">
                          Keep me signed in
                        </Label>
                      </div>
                      <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                        Forgot password?
                      </Link>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                      </div>
                    ) : (
                      mode === 'signin' ? 'Sign In' : 'Create Account'
                    )}
                  </Button>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                      OR
                    </span>
                  </div>

                  <Button variant="outline" className="w-full" size="lg" type="button">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    {mode === 'signin' ? (
                      <>
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('signup');
                            resetForm();
                          }}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setMode('signin');
                            resetForm();
                          }}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </CardContent>
              </form>
            </GlassCard>
          </motion.div>

          {/* Right Side - Hero & Testimonials */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Join Our Community Impact
              </h1>
              <p className="text-xl text-gray-600">
                Together, we're connecting surplus food to families in need across South Africa.
              </p>
            </div>

            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <GlassCard className="text-left">
                    <p className="text-gray-700 mb-2">"{testimonial.text}"</p>
                    <p className="text-sm text-gray-500 font-medium">{testimonial.author}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
