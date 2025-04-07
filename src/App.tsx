
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/home" element={<Home />} />
          <Route path="/sos-activated" element={<SOSActivated />} />
          <Route path="/drive" element={<Drive />} />
          <Route path="/voice-activation" element={<VoiceActivation />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
