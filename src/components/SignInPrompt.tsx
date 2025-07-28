import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, LogIn, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  action?: string;
}

const SignInPrompt: React.FC<SignInPromptProps> = ({
  isOpen,
  onClose,
  title = "Sign In Required",
  description = "Please sign in to continue with this action.",
  action = "Sign In"
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/signin', { state: { from: window.location.pathname } });
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signin', { state: { from: window.location.pathname, mode: 'signup' } });
  };

  if (user) {
    return null; // Don't show if user is already signed in
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md mx-4"
          >
            <Card className="border-2 border-green-200 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <LogIn className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={handleSignIn}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    {action}
                  </Button>
                  <Button 
                    onClick={handleSignUp}
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
                <div className="text-center">
                  <button
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Continue without signing in
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignInPrompt; 