
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Phone, Mail, MapPin, Upload, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setProfile(data);
      } else {
        // Create default profile if not exists
        const defaultProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          address: '',
          avatar_url: null
        };
        
        setProfile(defaultProfile);
        
        // Save default profile to database
        await supabase.from('profiles').insert(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    
    try {
      // Upload avatar image
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, avatarFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    
    try {
      let avatarUrl = profile.avatar_url;
      
      // Upload avatar if a new file was selected
      if (avatarFile) {
        const url = await uploadAvatar();
        if (url) {
          avatarUrl = url;
        }
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({
        ...profile,
        avatar_url: avatarUrl
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
      setAvatarFile(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-card border-b border-border">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
        
        <Button
          onClick={saveProfile}
          size="sm"
          className="bg-safevox-primary hover:bg-safevox-primary/90"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading profile...</p>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative" onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-primary">
                  {profile.avatar_url || avatarFile ? (
                    <AvatarImage 
                      src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url || ''} 
                      alt={profile.full_name} 
                    />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer">
                  <Camera size={16} />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-2 text-sm text-muted-foreground">Tap to change profile picture</p>
            </div>
            
            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p>Could not load profile. Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
