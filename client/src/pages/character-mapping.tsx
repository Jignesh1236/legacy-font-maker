import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MappingConfiguration } from "@/components/mapping-configuration";
import { TextConversionArea } from "@/components/text-conversion-area";
import { AdvancedOptions } from "@/components/advanced-options";
import { Statistics } from "@/components/statistics";
import { Languages, HelpCircle, Save } from "lucide-react";

export default function CharacterMapping() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-lg p-2">
                <Languages className="text-primary-foreground text-xl h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Character Mapping Tool</h1>
                <p className="text-sm text-muted-foreground">Convert text using custom character mappings</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open('https://discord.gg/rYHX8cfbYT', '_blank')}
                data-testid="button-help"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button variant="default" size="sm" data-testid="button-save-config">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Mapping Configuration */}
        <MappingConfiguration />

        {/* Text Conversion Area */}
        <TextConversionArea />

        {/* Advanced Options */}
        <AdvancedOptions />

        {/* Statistics */}
        <Statistics />
      </div>
    </div>
  );
}
