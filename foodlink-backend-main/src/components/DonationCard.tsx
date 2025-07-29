import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Users, AlertCircle } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DonationCardProps {
  donation: {
    id: string;
    title: string;
    description?: string;
    food_category: string;
    status: string;
    pickup_address: string;
    pickup_time_start: string;
    pickup_time_end: string;
    estimated_meals?: number;
    expiry_date?: string;
    created_at: string;
  };
  showActions?: boolean;
  onClaim?: (donationId: string) => void;
}

export default function DonationCard({ donation, showActions = false, onClaim }: DonationCardProps) {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'claimed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fresh': return 'bg-green-50 text-green-700 border-green-200';
      case 'packaged': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'prepared': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'bakery': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleClaim = async () => {
    if (!onClaim) return;
    
    setLoading(true);
    try {
      await onClaim(donation.id);
    } catch (error) {
      console.error('Error claiming donation:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = donation.expiry_date && 
    new Date(donation.expiry_date) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-hover transition-all duration-300 border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">{donation.title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {donation.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={getStatusColor(donation.status)}>
              {donation.status}
            </Badge>
            <Badge variant="outline" className={getCategoryColor(donation.food_category)}>
              {donation.food_category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{donation.pickup_address}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {new Date(donation.pickup_time_start).toLocaleDateString()} - 
              {new Date(donation.pickup_time_end).toLocaleDateString()}
            </span>
          </div>
          
          {donation.estimated_meals && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>~{donation.estimated_meals} meals</span>
            </div>
          )}
          
          {isExpiringSoon && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">Expires soon!</span>
            </div>
          )}
        </div>

        {showActions && donation.status === 'available' && (
          <Button 
            onClick={handleClaim}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
          >
            {loading ? 'Claiming...' : 'Claim Donation'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}