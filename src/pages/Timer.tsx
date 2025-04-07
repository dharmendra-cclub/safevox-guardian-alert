import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, Calendar, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import BottomNavBar from '@/components/BottomNavBar';
import { useAuth } from '@/hooks/useAuth';

interface ScheduledTime {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  enabled: boolean;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Timer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduledTime[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduledTime, 'id'>>({
    name: '',
    startTime: '08:00',
    endTime: '09:00',
    daysOfWeek: [],
    enabled: true
  });

  // Load saved schedules from localStorage
  useEffect(() => {
    if (user) {
      const savedSchedules = localStorage.getItem(`timers_${user.id}`);
      if (savedSchedules) {
        try {
          setSchedules(JSON.parse(savedSchedules));
        } catch (error) {
          console.error('Error parsing saved schedules:', error);
        }
      }
    }
  }, [user]);

  // Save schedules to localStorage when updated
  useEffect(() => {
    if (user && schedules.length > 0) {
      localStorage.setItem(`timers_${user.id}`, JSON.stringify(schedules));
    }
  }, [schedules, user]);

  const handleDayToggle = (day: string) => {
    setNewSchedule(prev => {
      if (prev.daysOfWeek.includes(day)) {
        return {
          ...prev,
          daysOfWeek: prev.daysOfWeek.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          daysOfWeek: [...prev.daysOfWeek, day]
        };
      }
    });
  };

  const addSchedule = () => {
    if (!newSchedule.name) {
      toast.error('Please enter a name for this schedule');
      return;
    }

    if (newSchedule.daysOfWeek.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    const newId = Date.now().toString();
    const scheduleToAdd = {
      ...newSchedule,
      id: newId
    };

    setSchedules([...schedules, scheduleToAdd]);
    setShowAddForm(false);
    setNewSchedule({
      name: '',
      startTime: '08:00',
      endTime: '09:00',
      daysOfWeek: [],
      enabled: true
    });

    toast.success('Driving schedule added');
  };

  const deleteSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
    toast.info('Schedule removed');
  };

  const toggleSchedule = (id: string) => {
    setSchedules(schedules.map(schedule => {
      if (schedule.id === id) {
        return {
          ...schedule,
          enabled: !schedule.enabled
        };
      }
      return schedule;
    }));
  };

  const saveAllSchedules = () => {
    if (user) {
      localStorage.setItem(`timers_${user.id}`, JSON.stringify(schedules));
      toast.success('All schedules saved successfully');
      navigate('/home');
    }
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
          <h1 className="text-xl font-bold">Timer</h1>
        </div>
        
        <Button
          onClick={saveAllSchedules}
          size="sm"
          className="bg-safevox-primary hover:bg-safevox-primary/90"
        >
          <Save size={16} className="mr-2" />
          Save
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Add scheduled times when driving mode should be automatically activated.
            The app will run in the background during these times to detect accidents.
          </p>
        </div>

        {/* Existing Schedules */}
        {schedules.length > 0 ? (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold">Your Schedules</h2>
            {schedules.map(schedule => (
              <div key={schedule.id} className="border border-border rounded-lg p-3 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{schedule.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={schedule.enabled}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-sm mb-2">
                  <Clock size={16} className="mr-1 text-muted-foreground" />
                  <span>{schedule.startTime} - {schedule.endTime}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar size={16} className="mr-1 text-muted-foreground" />
                  <span>{schedule.daysOfWeek.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 mb-4 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No schedules added yet</p>
          </div>
        )}

        {/* Add Schedule Form */}
        {showAddForm ? (
          <div className="border border-border rounded-lg p-4 bg-card mb-6">
            <h2 className="text-lg font-semibold mb-3">Add New Schedule</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleName">Schedule Name</Label>
                <Input
                  id="scheduleName"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  placeholder="E.g., Morning Commute"
                  className="bg-input mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="bg-input mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="bg-input mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Days of Week</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      type="button"
                      variant={newSchedule.daysOfWeek.includes(day) ? "default" : "outline"}
                      className={`min-w-[3rem] px-2 ${newSchedule.daysOfWeek.includes(day) ? 'bg-safevox-primary' : ''}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="enabled">Enabled</Label>
                <Switch 
                  id="enabled"
                  checked={newSchedule.enabled}
                  onCheckedChange={(checked) => setNewSchedule({...newSchedule, enabled: checked})}
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addSchedule}
                  className="flex-1 bg-safevox-primary hover:bg-safevox-primary/90"
                >
                  Add Schedule
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6"
          >
            <Plus size={16} className="mr-2" />
            Add Schedule
          </Button>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default Timer;
