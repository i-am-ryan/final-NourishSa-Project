import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Heart, Truck } from 'lucide-react';


type UserType = 'donor' | 'recipient' | 'volunteer';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1) If we landed on /auth/callback, finish the magic-link flow:
    const handleCallback = async () => {
      if (location.pathname === '/auth/callback') {
        setIsLoading(true);
        try {
          const url = new URL(window.location.href);
          const code = url.searchParams.get('code');
    
          if (!code) {
            throw new Error('Missing authentication code in URL.');
          }
    
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
    
          if (data.session) {
            toast.success('Email confirmed! Redirecting you in a moment…');
            navigate('/');
          }
        } catch (err: any) {
          console.error('Callback error:', err);
          toast.error(err.message || 'Something went wrong confirming your email.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    

    // 2) Handle direct `?verified=true` or `?error=` links (optional):
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      toast.success('Email verified successfully! You can now sign in.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (urlParams.get('error')) {
      toast.error(urlParams.get('error_description') || 'Email verification failed.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 3) If they’re already logged in, bounce them home
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigate('/');
    };

    handleCallback();
    checkUser();
  }, [location.pathname, navigate]);

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const fullName = formData.get('fullName') as string;
      const phone = formData.get('phone') as string;
      const userType = formData.get('userType') as UserType;
      const address = formData.get('address') as string;

      const redirectUrl =
        'https://final-nourish-sa-project.vercel.app/auth/callback';

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
      toast.success(
        'Account created! Check your inbox for a verification link.'
      );
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast.error(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.message?.includes('Email not confirmed')) {
        toast.error(
          'Please verify your email before signing in. Check your inbox for the link.'
        );
      } else {
        toast.error(err.message || 'Failed to sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const UserTypeCard = ({
    type,
    icon: Icon,
    title,
    description,
  }: {
    type: UserType;
    icon: React.ComponentType<any>;
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
          <CardDescription>
            Join our community to fight food waste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
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
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Make sure you’ve verified your email before signing in.
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                {/* … your fullName, email, phone, address, password inputs … */}

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
                          description="Share surplus food"
                        />
                      </SelectItem>
                      <SelectItem value="recipient">
                        <UserTypeCard
                          type="recipient"
                          icon={User}
                          title="Recipient"
                          description="Receive donated food"
                        />
                      </SelectItem>
                      <SelectItem value="volunteer">
                        <UserTypeCard
                          type="volunteer"
                          icon={Truck}
                          title="Volunteer"
                          description="Help deliver food"
                        />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  You’ll receive a verification email momentarily.
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
