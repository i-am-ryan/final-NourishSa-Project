import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code');
      const next = searchParams.get('next');

      if (code) {
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Verification error:', error);
            toast({
              title: "Verification Failed",
              description: error.message || "Failed to verify your email.",
              variant: "destructive",
            });
            navigate('/signin?error=verification_failed');
            return;
          }

          toast({
            title: "Email Verified!",
            description: "Your email has been verified successfully.",
          });
          navigate(next || '/');
        } catch (err) {
          console.error('Unexpected error:', err);
          navigate('/signin?error=unexpected_error');
        }
      } else {
        toast({
          title: "Missing Code",
          description: "Invalid verification link.",
          variant: "destructive",
        });
        navigate('/signin?error=missing_code');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying your account...</h2>
        <p className="text-gray-600">Please wait while we confirm your email address.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
