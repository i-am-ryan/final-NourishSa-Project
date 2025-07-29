import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Heart, Truck, User, MapPin, Clock, Award, Plus } from 'lucide-react';
import { toast } from 'sonner';
import DonationCard from '@/components/DonationCard';
import TaskCard from '@/components/TaskCard';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [donations, setDonations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalMeals: 0,
    completedTasks: 0,
    points: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch donations if user is a donor
      if (profile?.user_type === 'donor') {
        const { data: donationData } = await supabase
          .from('donations')
          .select('*')
          .eq('donor_id', user?.id)
          .order('created_at', { ascending: false });
        setDonations(donationData || []);
      }

      // Fetch volunteer tasks if user is a volunteer
      if (profile?.user_type === 'volunteer') {
        const { data: taskData } = await supabase
          .from('volunteer_tasks')
          .select(`
            *,
            donation:donation_id(title, pickup_address, food_category)
          `)
          .eq('volunteer_id', user?.id)
          .order('created_at', { ascending: false });
        setTasks(taskData || []);

        // Fetch volunteer stats
        const { data: rewardsData } = await supabase
          .from('volunteer_rewards')
          .select('points_earned')
          .eq('volunteer_id', user?.id);
        
        const totalPoints = rewardsData?.reduce((sum, reward) => sum + reward.points_earned, 0) || 0;
        setStats(prev => ({ ...prev, points: totalPoints }));
      }

      // Fetch general stats
      setStats(prev => ({
        ...prev,
        totalDonations: profile?.total_donations || 0,
        totalMeals: profile?.total_meals_provided || 0
      }));

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_tasks')
        .update({ 
          status: newStatus as 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
        })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task status updated successfully');
      fetchUserData(); // Refresh data
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'donor': return Heart;
      case 'volunteer': return Truck;
      default: return User;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'donor': return 'bg-rose-100 text-rose-800';
      case 'volunteer': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'claimed': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.profile_picture_url} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Welcome, {profile?.full_name || 'User'}</h1>
              <div className="flex items-center space-x-2">
                <Badge className={getUserTypeColor(profile?.user_type)}>
                  {profile?.user_type || 'User'}
                </Badge>
                {profile?.verification_status === 'verified' && (
                  <Badge variant="secondary">✓ Verified</Badge>
                )}
              </div>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meals Provided</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeals}</div>
            </CardContent>
          </Card>

          {profile?.user_type === 'volunteer' && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.points}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {profile?.user_type === 'donor' && (
              <TabsTrigger value="donations">My Donations</TabsTrigger>
            )}
            {profile?.user_type === 'volunteer' && (
              <TabsTrigger value="tasks">My Tasks</TabsTrigger>
            )}
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>
                  Your activity summary and recent updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.address || 'No address provided'}</span>
                  </div>
                  
                  {profile?.user_type === 'volunteer' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Volunteer Rating</span>
                        <span className="text-sm">{profile?.volunteer_rating?.toFixed(1) || '5.0'}/5.0</span>
                      </div>
                      <Progress value={(profile?.volunteer_rating || 5) * 20} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.user_type === 'donor' && (
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>My Donations</CardTitle>
                  <CardDescription>
                    Track your food donations and their impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donations.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          No donations yet. Start making a difference today!
                        </p>
                        <Button className="bg-gradient-to-r from-primary to-primary-glow">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Donation
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {donations.map((donation: any) => (
                          <DonationCard
                            key={donation.id}
                            donation={donation}
                            showActions={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {profile?.user_type === 'volunteer' && (
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>My Volunteer Tasks</CardTitle>
                  <CardDescription>
                    Your assigned pickup and delivery tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No tasks assigned yet. Check back soon!
                      </p>
                    ) : (
                      <div className="grid gap-4">
                        {tasks.map((task: any) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            showActions={true}
                            onStatusUpdate={handleTaskStatusUpdate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <p className="text-sm text-muted-foreground">{profile?.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account Type</label>
                    <p className="text-sm text-muted-foreground capitalize">{profile?.user_type || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}