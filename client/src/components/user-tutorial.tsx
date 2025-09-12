import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Upload, 
  Trash2, 
  Type, 
  Lightbulb,
  AlertTriangle,
  Play
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  highlightElement?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Character Mapping Tool",
    description: "आइए step-by-step सीखते हैं",
    content: "यह tool English text को Gujarati में convert करता है। बस 3 simple steps!",
    icon: <Play className="h-4 w-4" />
  },
  {
    id: 2,
    title: "पहले सभी Rules साफ करें",
    description: "Clear All button पर click करें",
    content: "Custom mapping के लिए पहले existing rules हटाना जरूरी है",
    icon: <Trash2 className="h-4 w-4" />,
    highlightElement: "[data-testid='button-clear-all']"
  },
  {
    id: 3,
    title: "अपनी JSON File Upload करें",
    description: "Import button या drag-drop करें",
    content: "अपनी custom mapping file को यहाँ upload करें",
    icon: <Upload className="h-4 w-4" />,
    highlightElement: "[data-testid='drop-zone']"
  },
  {
    id: 4,
    title: "Text Type करना शुरू करें",
    description: "Source Text box में लिखें",
    content: "यहाँ type करें, automatic conversion होगा",
    icon: <Type className="h-4 w-4" />,
    highlightElement: "[data-testid='textarea-source-text']"
  }
];

export function UserTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('character-mapping-tutorial-seen');
    if (!tutorialSeen) {
      setTimeout(() => setIsOpen(true), 1000); // Delay to let page load
    } else {
      setHasSeenTutorial(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setHasSeenTutorial(true);
    localStorage.setItem('character-mapping-tutorial-seen', 'true');
  };

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;

  // Update target position and create spotlight effect
  useEffect(() => {
    if (isOpen && currentStepData?.highlightElement) {
      const element = document.querySelector(currentStepData.highlightElement) as HTMLElement;
      if (element) {
        // Scroll to element first
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetPosition({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          });
        }, 500);
      }
    }
  }, [isOpen, currentStep, currentStepData?.highlightElement]);

  const showTutorial = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return hasSeenTutorial ? (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={showTutorial}
          className="shadow-lg"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Tutorial
        </Button>
      </div>
    ) : null;
  }

  return (
    <>
      {/* Spotlight Overlay */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{
          background: currentStepData?.highlightElement
            ? `radial-gradient(ellipse ${targetPosition.width + 40}px ${targetPosition.height + 40}px at ${targetPosition.x + targetPosition.width/2}px ${targetPosition.y + targetPosition.height/2}px, transparent 0%, transparent 40%, rgba(0,0,0,0.7) 70%)`
            : 'rgba(0,0,0,0.7)'
        }}
      />

      {/* Tutorial Tooltip */}
      <div 
        className="fixed z-[10000] pointer-events-auto"
        style={{
          left: isFirstStep ? '50%' : Math.min(targetPosition.x + targetPosition.width + 20, window.innerWidth - 320),
          top: isFirstStep ? '50%' : Math.max(20, targetPosition.y),
          transform: isFirstStep ? 'translate(-50%, -50%)' : 'none'
        }}
      >
        <Card className="w-80 shadow-xl border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 p-1.5 rounded">
                  {currentStepData?.icon}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {currentStep + 1}/{tutorialSteps.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm">{currentStepData?.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData?.content}</p>
              
              {/* Progress bar */}
              <div className="flex space-x-1">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {!isFirstStep ? (
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                ) : <div />}
                
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    Skip
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    {currentStep === tutorialSteps.length - 1 ? 'Done' : 'Next'}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Highlight Ring */}
      {currentStepData?.highlightElement && (
        <div 
          className="fixed z-[9998] pointer-events-none animate-pulse"
          style={{
            left: targetPosition.x - 4,
            top: targetPosition.y - 4,
            width: targetPosition.width + 8,
            height: targetPosition.height + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3)',
          }}
        />
      )}
    </>
  );
}