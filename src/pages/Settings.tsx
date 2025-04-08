
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Moon, Sun, Volume2, Bell, Lock, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [autoRecording, setAutoRecording] = useState(true);
  
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    // In a real app, this would change the theme
    toast.success(`Dark mode ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleVoiceActivationToggle = (enabled: boolean) => {
    setVoiceActivationEnabled(enabled);
    if (enabled) {
      toast.success('Voice activation enabled');
      navigate('/voice-activation');
    } else {
      toast.info('Voice activation disabled');
    }
  };
  
  const handleAutoRecordingToggle = (enabled: boolean) => {
    setAutoRecording(enabled);
    toast.success(`Auto recording ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  const handlePasswordChange = () => {
    toast.info('Password change feature will be implemented soon');
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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Appearance */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? <Moon className="mr-2" /> : <Sun className="mr-2" />}
                <span>Dark Mode</span>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle} 
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-4 space-y-3">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2" />
                <span>Enable Notifications</span>
              </div>
              <Switch 
                checked={notificationsEnabled} 
                onCheckedChange={handleNotificationsToggle} 
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-4 space-y-3">
            <h2 className="text-lg font-semibold">Voice & Audio</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="mr-2" />
                <span>Voice Activation</span>
              </div>
              <Switch 
                checked={voiceActivationEnabled} 
                onCheckedChange={handleVoiceActivationToggle} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <div className="flex items-center">
                <Volume2 className="mr-2" size={16} />
                <Slider
                  id="volume"
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Automatic Recording in Emergency</span>
              <Switch 
                checked={autoRecording} 
                onCheckedChange={handleAutoRecordingToggle} 
              />
            </div>
          </div>
          
          <div className="border-t border-border pt-4 space-y-3">
            <h2 className="text-lg font-semibold">Security</h2>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handlePasswordChange}
            >
              <Lock className="mr-2" size={16} />
              Change Password
            </Button>
          </div>
          
          <div className="border-t border-border pt-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
