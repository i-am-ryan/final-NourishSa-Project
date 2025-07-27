import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit, Save, X, CreditCard, FileText, Shield } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const Profile = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [userType, setUserType] = useState(profile?.user_type || 'donor');
  const [idNumber, setIdNumber] = useState(profile?.id_number || '');
  const [idType, setIdType] = useState(profile?.id_type || 'sa_id');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        phone: phone,
        address: address,
        user_type: userType,
        id_number: idNumber,
        id_type: idType,
      });

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update profile.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setUserType(profile?.user_type || 'donor');
    setIdNumber(profile?.id_number || '');
    setIdType(profile?.id_type || 'sa_id');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Please sign in to view your profile.</p>
            <Button onClick={() => navigate('/signin')} className="w-full mt-4">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userTypeLabels = {
    donor: 'Food Donor',
    volunteer: 'Volunteer',
    recipient: 'Food Recipient',
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <GlassCard>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl">Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and preferences
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="email"
                          value={user.email || ''}
                          disabled
                          className="pl-10 bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="userType">User Type</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'donor', label: 'Donor' },
                          { value: 'volunteer', label: 'Volunteer' },
                          { value: 'recipient', label: 'Recipient' }
                        ].map((type) => (
                          <Button
                            key={type.value}
                            type="button"
                            variant={userType === type.value ? "default" : "outline"}
                            onClick={() => isEditing && setUserType(type.value as any)}
                            disabled={!isEditing}
                            className="text-xs"
                          >
                            {type.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Your address"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="idType">Identity Verification</Label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {[
                          { value: 'sa_id', label: 'SA ID Number', icon: CreditCard },
                          { value: 'passport', label: 'Passport', icon: FileText }
                        ].map((type) => (
                          <Button
                            key={type.value}
                            type="button"
                            variant={idType === type.value ? "default" : "outline"}
                            onClick={() => isEditing && setIdType(type.value as any)}
                            disabled={!isEditing}
                            className="text-xs"
                          >
                            <type.icon className="w-3 h-3 mr-1" />
                            {type.label}
                          </Button>
                        ))}
                      </div>
                      <div className="relative">
                        {idType === 'sa_id' ? (
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        ) : (
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        )}
                        <Input
                          id="idNumber"
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder={idType === 'sa_id' ? "YYMMDD 0000 000" : "A12345678"}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {idType === 'sa_id' 
                          ? "13-digit South African ID number"
                          : "Passport number"
                        }
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Info */}
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                      <p className="text-sm text-gray-500">{userTypeLabels[userType as keyof typeof userTypeLabels]}</p>
                    </div>
                  </div>
                  
                  {profile?.id_number && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Identity Verified</span>
                      <span className="text-gray-500">({profile.id_type === 'sa_id' ? 'SA ID' : 'Passport'})</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member since:</span>
                      <span>{new Date(user.created_at || '').toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last sign in:</span>
                      <span>{new Date(user.last_sign_in_at || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Activity History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage Locations
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                </CardContent>
              </GlassCard>

              {/* Sign Out */}
              <GlassCard>
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 