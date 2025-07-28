import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Heart, Truck } from 'lucide-react';

type UserType = 'donor' | 'recipient' | 'volunteer';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in and handle email verification
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    // Handle email verification callback
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (verified === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      toast.error(errorDescription || 'Email verification failed. Please try again.');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkUser();
  }, [navigate]);
// Auth.tsx



  // ... (keep existing state and useEffect)

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const userType = formData.get('userType') as UserType;
    const address = formData.get('address') as string;

    try {
      // Use the deployed URL instead of localhost:8080
      const redirectUrl = 'https://final-nourish-sa-project.vercel.app/auth/callback';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone,
            user_type: userType,
            address,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created! Please check your email to verify your account.');
        // Do not navigate immediately; wait for verification
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep existing handleSignIn, UserTypeCard, and return)


  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.message?.includes('Email not confirmed')) {
        toast.error('Please verify your email address before signing in. Check your inbox for the verification link.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const UserTypeCard = ({ type, icon: Icon, title, description }: {
    type: UserType;
    icon: any;
    title: string;
    description: string;
  }) => (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <Icon className="h-5 w-5 text-primary" />
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NourishSA</CardTitle>
          <CardDescription>Join our community to fight food waste</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={(e) => { e.preventDefault(); handleSignIn(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Having trouble? Make sure you've verified your email address.
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={(e) => { e.preventDefault(); handleSignUp(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+27 123 456 7890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Your address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <Select name="userType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="donor">
                        <UserTypeCard
                          type="donor"
                          icon={Heart}
                          title="Food Donor"
                          description="Share surplus food with community"
                        />
                      </SelectItem>
                      <SelectItem value="recipient">
                        <UserTypeCard
                          type="recipient"
                          icon={User}
                          title="Food Recipient"
                          description="Access donated food in your area"
                        />
                      </SelectItem>
                      <SelectItem value="volunteer">
                        <UserTypeCard
                          type="volunteer"
                          icon={Truck}
                          title="Volunteer"
                          description="Help deliver food to those in need"
                        />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  You'll receive an email to verify your account after signing up.
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}