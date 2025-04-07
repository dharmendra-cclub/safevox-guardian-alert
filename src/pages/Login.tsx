
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Simulate authentication - in a real app, this would call an API
    setTimeout(() => {
      // Store user info in localStorage (in a real app would use proper auth state management)
      localStorage.setItem('user', JSON.stringify({ email }));
      
      setLoading(false);
      toast.success('Login successful');
      navigate('/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-muted-foreground mb-6"
      >
        <ArrowLeft size={18} className="mr-1" />
        Back
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input text-foreground"
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-safevox-primary hover:bg-safevox-primary/90"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-safevox-primary hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
