import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AuthTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authStatus, setAuthStatus] = useState<string>('');
  const { user, profile, signUp, signIn, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthStatus('Authenticated');
        // Check if user profile exists
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Profile fetch error:', error);
          setUserProfile(null);
        } else {
          setUserProfile(profileData);
        }
      } else {
        setAuthStatus('Not authenticated');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus('Error checking auth');
    }
  };

  const handleTestSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, {
        full_name: 'Test User',
        phone: '+27123456789',
        user_type: 'donor',
        address: 'Test Address',
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (data?.user && !data?.session) {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
        } else if (data?.session) {
          toast({
            title: "Welcome!",
            description: "Your account has been created and you're now signed in.",
          });
        }
        await checkAuthStatus();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign In Success",
          description: "You are now signed in!",
        });
        await checkAuthStatus();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      await checkAuthStatus();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        toast({
          title: "Database Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Database Connected",
          description: "Successfully connected to user_profiles table.",
        });
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication System Test</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Auth Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current authentication state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p><strong>Status:</strong> {authStatus}</p>
                <p><strong>User ID:</strong> {user?.id || 'None'}</p>
                <p><strong>Email:</strong> {user?.email || 'None'}</p>
                <p><strong>Profile Exists:</strong> {userProfile ? 'Yes' : 'No'}</p>
              </div>
              
              {userProfile && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">User Profile:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(userProfile, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="space-y-2">
                <Button onClick={checkAuthStatus} variant="outline" className="w-full">
                  Refresh Status
                </Button>
                <Button onClick={testDatabaseConnection} variant="outline" className="w-full">
                  Test Database Connection
                </Button>
                {user && (
                  <Button onClick={handleSignOut} variant="destructive" className="w-full">
                    Sign Out
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sign Up Test */}
          <Card>
            <CardHeader>
              <CardTitle>Sign Up Test</CardTitle>
              <CardDescription>Test user registration</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Signing Up..." : "Test Sign Up"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Test */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In Test</CardTitle>
              <CardDescription>Test user authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTestSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Signing In..." : "Test Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>System configuration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p><strong>Supabase URL:</strong> {process.env.VITE_SUPABASE_URL || 'Not set'}</p>
                <p><strong>Project ID:</strong> lrvgennjbmmbtpywloem</p>
                <p><strong>User Table:</strong> user_profiles</p>
                <p><strong>Auth Table:</strong> auth.users</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current User Data:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({ user, profile }, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthTest; 