import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/supabase';

const EmailTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleTestSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, {
        full_name: 'Test User',
        phone: '+27123456789',
        id_number: '9001015000000',
        id_type: 'sa_id',
        user_type: 'donor',
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
            description: "Please check your email to verify your account. You'll be automatically signed in after verification.",
          });
        } else if (data?.session) {
          toast({
            title: "Welcome!",
            description: "Your account has been created and you're now signed in.",
          });
        }
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

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await auth.signUp(email, password, {
        full_name: 'Test User',
        phone: '+27123456789',
        id_number: '9001015000000',
        id_type: 'sa_id',
        user_type: 'donor',
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Email Sent",
          description: `Check ${email} for verification email`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Verification Test</CardTitle>
            <CardDescription>
              Test the email verification system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleTestSignUp}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Testing..." : "Test Sign Up"}
              </Button>
              <Button 
                onClick={handleTestEmail}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "Sending..." : "Send Test Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTest; 