
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRole } from '@/types/supabase';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      let updatedAvatarUrl = avatarUrl;
      
      // Upload avatar if changed
      if (avatarFile) {
        // Check if storage bucket exists first
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
        
        // Create bucket if it doesn't exist
        if (!avatarBucket) {
          await supabase.storage.createBucket('avatars', { public: true });
        }
        
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true });
          
        if (error) throw error;
        
        const { data: publicUrl } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        updatedAvatarUrl = publicUrl.publicUrl;
      }
      
      await updateProfile({
        full_name: fullName,
        phone,
        address,
        avatar_url: updatedAvatarUrl,
        profile_complete: true
      });
      
      setAvatarFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'buyer': return 'Buyer';
      case 'farmer': return 'Farmer/Seller';
      case 'admin': return 'Administrator';
      case 'delivery': return 'Delivery Agent';
      default: return 'User';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{fullName.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-medium">{fullName || 'Complete Your Profile'}</h2>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                
                <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {getRoleDisplay(profile.role)}
                </div>
                
                <label className="cursor-pointer bg-muted hover:bg-muted/80 text-center px-4 py-2 rounded-md w-full transition-colors">
                  Change Avatar
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
                
                <Button 
                  variant="outline" 
                  className="mt-6 w-full"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="personal">
                  <TabsList className="mb-6">
                    <TabsTrigger value="personal">Personal Info</TabsTrigger>
                    <TabsTrigger value="address">Address</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="personal" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={user.email || ''} 
                        disabled
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="address" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your address"
                      />
                    </div>
                    
                    {profile.role === 'farmer' && (
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm mb-2">
                          For farmers: Your location will be used to help buyers find local produce.
                        </p>
                        <Button variant="outline" className="text-sm">
                          Use Current Location
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4">
                    <p className="text-muted-foreground">Account settings and preferences will appear here.</p>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-6">
                  <Button 
                    className="bg-cropmate-primary hover:bg-cropmate-primary/90 w-full"
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
