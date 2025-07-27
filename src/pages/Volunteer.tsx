
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import HeroImpactSection from '@/components/volunteer/HeroImpactSection';
import TaskBoard from '@/components/volunteer/TaskBoard';
import ProgressTracker from '@/components/volunteer/ProgressTracker';
import CommunityFeed from '@/components/volunteer/CommunityFeed';
import InteractiveCalendar from '@/components/InteractiveCalendar';
import LoginModal from '@/components/volunteer/LoginModal';
import RoleSelector from '@/components/volunteer/RoleSelector';
import { Button } from '@/components/ui/button';
import { useVolunteerTasks } from '@/hooks/useVolunteerTasks';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Calendar, Target, BarChart3, Camera, Heart, Truck, Package } from 'lucide-react';

const Volunteer = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'login' | 'role-selection' | 'hub'>('welcome');
  const [activeTab, setActiveTab] = useState<'tasks' | 'impact' | 'stories' | 'schedule'>('tasks');
  const [selectedRole, setSelectedRole] = useState<'pickup' | 'delivery' | null>(null);
  const [showProgressDrawer, setShowProgressDrawer] = useState(false);
  const [showCommunityPrompt, setShowCommunityPrompt] = useState(false);

  const { user, profile } = useAuth();
  const { tasks, loading, error, acceptTask, updateTask, getStats } = useVolunteerTasks({
    status: 'pending',
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  });

  // Transform API tasks to match the expected format
  const transformedTasks = tasks.map((task, index) => ({
    id: index + 1, // Use numeric ID for compatibility
    type: 'pickup' as const,
    business: task.donation?.title || 'Unknown Donor',
    location: task.donation?.pickup_address || 'Unknown Location',
    time: new Date(task.scheduled_time).toLocaleTimeString(),
    items: `${task.donation?.estimated_meals || 0} estimated meals`,
    points: Math.floor(Math.random() * 20) + 10, // Random points for demo
    status: task.status as 'available' | 'in-progress' | 'completed'
  }));

  const [volunteerStats, setVolunteerStats] = useState({
    totalPoints: 145,
    tasksCompleted: 23,
    rank: 'Community Champion',
    level: 3
  });

  // Filter tasks based on selected role
  const filteredTasks = selectedRole ? transformedTasks.filter(task => task.type === selectedRole) : transformedTasks;

  const handleTaskUpdate = async (taskId: number, newStatus: 'available' | 'in-progress' | 'completed') => {
    try {
      // Find the original task ID from the transformed tasks
      const originalTaskId = tasks[taskId - 1]?.id;
      if (originalTaskId) {
        await updateTask(originalTaskId, { status: newStatus });
        if (newStatus === 'completed') {
          setShowProgressDrawer(true);
          setTimeout(() => setShowCommunityPrompt(true), 2000);
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      await acceptTask(taskId);
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    // This would be handled by the LoginModal component
    setCurrentView('role-selection');
  };

  // Check if user is logged in
  const isLoggedIn = !!user;
  const userName = user?.email?.split('@')[0] || profile?.full_name || 'Volunteer';

  const handleRoleSelection = (role: 'pickup' | 'delivery') => {
    setSelectedRole(role);
    setCurrentView('hub');
  };

  const startVolunteering = () => {
    if (isLoggedIn) {
      setCurrentView('role-selection');
    } else {
      setCurrentView('login');
    }
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Hero Image */}
            <div className="relative h-64 mb-8 rounded-3xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070"
                alt="Community volunteers"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/80 to-transparent" />
            </div>

            {/* Welcome Message */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Time Changes Lives.
              <br />
              <span className="text-green-600">Let's Start Your Journey!</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of volunteers making a real difference in South African communities. 
              Every task you complete feeds families and builds hope.
            </p>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Meals Delivered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">89kg</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Food Rescued</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">156h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Volunteer Hours</div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              size="lg"
              onClick={startVolunteering}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Target className="w-6 h-6 mr-3" />
              Start Volunteering
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Login Modal
  if (currentView === 'login') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <LoginModal 
          onLogin={handleLogin}
          onBack={() => setCurrentView('welcome')}
        />
      </div>
    );
  }

  // Role Selection
  if (currentView === 'role-selection') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <RoleSelector 
          userName={userName}
          onRoleSelect={handleRoleSelection}
          onBack={() => setCurrentView('welcome')}
        />
      </div>
    );
  }

  // Volunteer Hub
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hi {userName}! 
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Let's make a difference today as a {selectedRole} volunteer
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('role-selection')}
              className="text-sm"
            >
              Switch Role
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setCurrentView('welcome');
              }}
              className="text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
            {[
              { id: 'tasks', label: 'Tasks', icon: selectedRole === 'pickup' ? Package : Truck },
              { id: 'impact', label: 'My Impact', icon: BarChart3 },
              { id: 'stories', label: 'Stories', icon: Camera },
              { id: 'schedule', label: 'Schedule', icon: Calendar }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-2 px-6 py-3"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'tasks' && (
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <TaskBoard 
                  tasks={filteredTasks} 
                  onTaskUpdate={handleTaskUpdate}
                  roleFilter={selectedRole}
                />
              </div>
              <div className="lg:col-span-1">
                <ProgressTracker volunteerStats={volunteerStats} />
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="max-w-4xl mx-auto">
              <HeroImpactSection volunteerStats={volunteerStats} />
              <ProgressTracker volunteerStats={volunteerStats} />
            </div>
          )}

          {activeTab === 'stories' && (
            <CommunityFeed />
          )}

          {activeTab === 'schedule' && (
            <div className="max-w-4xl mx-auto">
              <InteractiveCalendar />
            </div>
          )}
        </motion.div>

        {/* Progress Drawer */}
        {showProgressDrawer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-2xl rounded-t-3xl z-50"
          >
            <div className="p-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  🎉 Great work! Here's your progress
                </h3>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowProgressDrawer(false)}
                >
                  ✕
                </Button>
              </div>
              <ProgressTracker volunteerStats={volunteerStats} />
            </div>
          </motion.div>
        )}

        {/* Community Story Prompt */}
        {showCommunityPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md text-center">
              <Camera className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Want to share your impact with the community?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Upload a photo from your volunteer task to inspire others!
              </p>
              <div className="flex gap-3">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCommunityPrompt(false)}
                >
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Volunteer;