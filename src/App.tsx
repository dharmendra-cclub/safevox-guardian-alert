
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { MapProvider } from "./components/map";

import SplashScreen from "./pages/SplashScreen";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Permissions from "./pages/Permissions";
import Home from "./pages/Home";
import SOSActivated from "./pages/SOSActivated";
import Drive from "./pages/Drive";
import VoiceActivation from "./pages/VoiceActivation";
import EmergencyContacts from "./pages/EmergencyContacts";
import Recordings from "./pages/Recordings";
import NotFound from "./pages/NotFound";
import AuthRoute from "./components/AuthRoute";
import ImHere from "./pages/ImHere";
import Timer from "./pages/Timer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import History from "./pages/History";
import React from 'react';

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <MapProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/permissions" element={<Permissions />} />
                  
                  {/* Protected routes */}
                  <Route path="/home" element={<AuthRoute><Home /></AuthRoute>} />
                  <Route path="/sos-activated" element={<AuthRoute><SOSActivated /></AuthRoute>} />
                  <Route path="/drive" element={<AuthRoute><Drive /></AuthRoute>} />
                  <Route path="/voice-activation" element={<AuthRoute><VoiceActivation /></AuthRoute>} />
                  <Route path="/emergency-contacts" element={<AuthRoute><EmergencyContacts /></AuthRoute>} />
                  <Route path="/recordings" element={<AuthRoute><Recordings /></AuthRoute>} />
                  <Route path="/im-here" element={<AuthRoute><ImHere /></AuthRoute>} />
                  <Route path="/timer" element={<AuthRoute><Timer /></AuthRoute>} />
                  <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
                  <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>} />
                  <Route path="/help" element={<AuthRoute><Help /></AuthRoute>} />
                  <Route path="/history" element={<AuthRoute><History /></AuthRoute>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </MapProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
