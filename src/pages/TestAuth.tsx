import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateSAID, validatePassport } from '@/lib/verification';
import { useToast } from '@/hooks/use-toast';

const TestAuth = () => {
  const { user, profile, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const [testId, setTestId] = useState('');
  const [testPassport, setTestPassport] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');

  const handleTestIdValidation = () => {
    const result = validateSAID(testId);
    toast({
      title: result.isValid ? 'Valid ID' : 'Invalid ID',
      description: result.isValid ? 'ID number is valid!' : result.error,
      variant: result.isValid ? 'default' : 'destructive',
    });
  };

  const handleTestPassportValidation = () => {
    const result = validatePassport(testPassport);
    toast({
      title: result.isValid ? 'Valid Passport' : 'Invalid Passport',
      description: result.isValid ? 'Passport number is valid!' : result.error,
      variant: result.isValid ? 'default' : 'destructive',
    });
  };

  const handleTestSignIn = async () => {
    try {
      const { error } = await signIn(testEmail, testPassword);
      if (error) {
        toast({
          title: 'Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign In Success',
          description: 'You are now signed in!',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication Test Page</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* ID Validation Test */}
          <Card>
            <CardHeader>
              <CardTitle>ID Number Validation Test</CardTitle>
              <CardDescription>Test the ID number validation logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-id">Test ID Number</Label>
                <Input
                  id="test-id"
                  value={testId}
                  onChange={(e) => setTestId(e.target.value)}
                  placeholder="e.g., 9001015000000"
                />
              </div>
              <Button onClick={handleTestIdValidation} className="w-full">
                Test ID Validation
              </Button>
            </CardContent>
          </Card>

          {/* Passport Validation Test */}
          <Card>
            <CardHeader>
              <CardTitle>Passport Validation Test</CardTitle>
              <CardDescription>Test the passport number validation logic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-passport">Test Passport Number</Label>
                <Input
                  id="test-passport"
                  value={testPassport}
                  onChange={(e) => setTestPassport(e.target.value)}
                  placeholder="e.g., A12345678"
                />
              </div>
              <Button onClick={handleTestPassportValidation} className="w-full">
                Test Passport Validation
              </Button>
            </CardContent>
          </Card>

          {/* Sign In Test */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In Test</CardTitle>
              <CardDescription>Test the sign in functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Email</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="test-password">Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password"
                />
              </div>
              <Button onClick={handleTestSignIn} className="w-full">
                Test Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Current Auth Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Authentication Status</CardTitle>
              <CardDescription>View your current authentication state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p>
                  <strong>Signed In:</strong> {user ? 'Yes' : 'No'}
                </p>
                {user && (
                  <>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>User ID:</strong> {user.id}
                    </p>
                    {profile && (
                      <p>
                        <strong>Full Name:</strong> {profile.full_name}
                      </p>
                    )}
                  </>
                )}
              </div>
              {user && (
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID Number Test:</strong> Try these test IDs:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>9001015000000 (Valid - 1990-01-01, Male)</li>
                <li>8506154000000 (Valid - 1985-06-15, Female)</li>
                <li>0000000000000 (Invalid - Invalid date)</li>
              </ul>
              <p className="mt-4">
                <strong>Passport Test:</strong> Try these test passports:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>A12345678 (Valid)</li>
                <li>B87654321 (Valid)</li>
                <li>12345678 (Invalid - Missing letter)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAuth;