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
      try {
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next');

        if (tokenHash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });

          if (error) {
            console.error('Verification error:', error);
            toast({
              title: "Verification Failed",
              description: error.message || "Failed to verify email. Please try again.",
              variant: "destructive",
            });
            navigate('/signin?error=verification_failed');
            return;
          }

          if (data.user) {
            toast({
              title: "Email Verified!",
              description: "Your email has been successfully verified. Welcome to NourishSA!",
            });
            navigate(next || '/signin?verified=true');
          }
        } else {
          // Handle session from URL (for other auth flows)
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Session error:', error);
            navigate('/signin?error=session_error');
          } else if (session) {
            navigate('/');
          } else {
            navigate('/signin');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/signin?error=callback_error');
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