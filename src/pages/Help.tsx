
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, AlertTriangle, Car, Mic, Timer, Phone, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Help: React.FC = () => {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-bold">Help & Support</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div className="text-center py-4">
            <HelpCircle className="mx-auto h-12 w-12 text-primary mb-2" />
            <h2 className="text-xl font-bold">How can we help you?</h2>
            <p className="text-muted-foreground">Find answers to common questions</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center">
                  <AlertTriangle className="mr-3 h-5 w-5 text-red-500" />
                  <span>How does the SOS feature work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">The SOS feature allows you to quickly alert your emergency contacts when you're in danger:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Press the SOS button or say your designated codeword</li>
                  <li>An emergency alert with your location is sent to your contacts</li>
                  <li>Audio recording begins automatically to capture your surroundings</li>
                  <li>Your emergency contacts receive your real-time location</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center">
                  <Car className="mr-3 h-5 w-5 text-blue-500" />
                  <span>What is Drive Mode?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Drive Mode offers additional safety while you're driving:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Automatic accident detection using your device's sensors</li>
                  <li>Sends alerts to your emergency contacts if an accident is detected</li>
                  <li>Provides a distraction-free interface optimized for driving</li>
                  <li>Allows for voice commands to avoid manual interaction</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center">
                  <Mic className="mr-3 h-5 w-5 text-green-500" />
                  <span>How do Voice Codewords work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">Voice codewords allow you to activate emergency features hands-free:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Set up custom codewords in the Voice Activation screen</li>
                  <li>The app continuously listens for your codewords</li>
                  <li>When a codeword is detected, the SOS process is triggered</li>
                  <li>Different codewords can alert different emergency contacts</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center">
                  <Timer className="mr-3 h-5 w-5 text-yellow-500" />
                  <span>How does the Timer feature work?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">The Timer feature is useful when you expect to reach a destination in a specific timeframe:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Set a countdown timer for your journey</li>
                  <li>If you don't deactivate the timer before it expires, an SOS is automatically triggered</li>
                  <li>Useful for walks home at night or meeting strangers</li>
                  <li>You can add a custom message to be sent if the timer expires</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger className="flex items-center">
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-purple-500" />
                  <span>How do I add emergency contacts?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">To add emergency contacts:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Go to the Emergency Contacts screen from the menu</li>
                  <li>Tap the "Add Contact" button</li>
                  <li>Enter the contact's name and phone number</li>
                  <li>You can select contacts to be notified for specific codewords</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Need more help?</h3>
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => window.open('mailto:support@safevox.io')}
            >
              <span>Contact Support</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
