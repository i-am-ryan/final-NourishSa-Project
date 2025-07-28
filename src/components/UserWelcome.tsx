import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { User, Heart } from 'lucide-react';

interface UserWelcomeProps {
  className?: string;
  showBadge?: boolean;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ className = '', showBadge = false }) => {
  const { user, profile } = useAuth();

  if (!user) {
    return null;
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const userType = profile?.user_type || 'member';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showBadge && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <User className="w-3 h-3 mr-1" />
          {userType}
        </Badge>
      )}
      <span className="text-sm text-gray-600 dark:text-gray-300">
        Welcome back, <span className="font-semibold text-green-600 dark:text-green-400">{userName}</span>
      </span>
      <Heart className="w-4 h-4 text-green-600" />
    </div>
  );
};

export default UserWelcome; 