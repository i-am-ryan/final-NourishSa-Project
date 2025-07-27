import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Truck, Heart, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AvailableDonations from "@/components/AvailableDonations";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const claimDonation = async (donationId: string) => {
    toast({
      title: "Demo Mode",
      description: "This is a demo of the NourishSA backend. All API endpoints are ready!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/50 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
              NourishSA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Fighting food waste, feeding communities. Complete backend ready with API endpoints!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300" onClick={() => navigate('/auth')}>
                <Heart className="mr-2 h-5 w-5" />
                Donate Food
              </Button>
              <Button variant="outline" size="lg" className="hover:bg-secondary transition-colors" onClick={() => navigate('/auth')}>
                <Users className="mr-2 h-5 w-5" />
                Volunteer
              </Button>
              <Button variant="outline" size="lg" className="hover:bg-secondary transition-colors" onClick={() => navigate('/auth')}>
                <Target className="mr-2 h-5 w-5" />
                Find Food
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Donations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AvailableDonations />
      </div>

      {/* Backend Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Complete Backend Implementation</h2>
          <p className="text-lg text-muted-foreground">All API endpoints and database ready for your frontend</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-primary" />
                Donations API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Complete CRUD operations for food donations with geospatial matching
              </p>
              <Badge variant="secondary">5 endpoints ready</Badge>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-volunteer" />
                Volunteer System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Task management, leaderboards, and gamification system
              </p>
              <Badge variant="secondary">7 endpoints ready</Badge>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5 text-accent" />
                Smart Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered matching engine with route optimization
              </p>
              <Badge variant="secondary">4 endpoints ready</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
