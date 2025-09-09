import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MappingConfiguration } from "@shared/schema";
import { RotateCcw, Wand2 } from "lucide-react";

export function AdvancedOptions() {
  const [caseSensitivity, setCaseSensitivity] = useState("sensitive");
  const [mappingMode, setMappingMode] = useState("character");
  const [outputFormat, setOutputFormat] = useState("plain");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations = [] } = useQuery<MappingConfiguration[]>({
    queryKey: ["/api/mapping-configurations"],
  });

  const { data: defaultConfig } = useQuery<MappingConfiguration>({
    queryKey: ["/api/mapping-configurations/default"],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (configData: Partial<MappingConfiguration>) => {
      if (defaultConfig) {
        const response = await apiRequest("PUT", `/api/mapping-configurations/${defaultConfig.id}`, configData);
        return response.json();
      }
      throw new Error("No default configuration found");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-configurations"] });
      toast({
        title: "Configuration updated",
        description: "Advanced options have been applied successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
    },
  });

  const handleReset = () => {
    setCaseSensitivity("sensitive");
    setMappingMode("character");
    setOutputFormat("plain");
    toast({
      title: "Settings reset",
      description: "Advanced options have been reset to defaults.",
    });
  };

  const handleApply = () => {
    updateConfigMutation.mutate({
      caseSensitivity,
      mappingMode,
      outputFormat,
    });
  };

  // Set initial values from default config
  useState(() => {
    if (defaultConfig) {
      setCaseSensitivity(defaultConfig.caseSensitivity || "sensitive");
      setMappingMode(defaultConfig.mappingMode || "character");
      setOutputFormat(defaultConfig.outputFormat || "plain");
    }
  });

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold">Advanced Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Label htmlFor="case-sensitivity" className="block text-sm font-medium mb-2">
              Case Sensitivity
            </Label>
            <Select 
              value={caseSensitivity} 
              onValueChange={setCaseSensitivity}
              data-testid="select-case-sensitivity"
            >
              <SelectTrigger id="case-sensitivity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sensitive">Case Sensitive</SelectItem>
                <SelectItem value="insensitive">Case Insensitive</SelectItem>
                <SelectItem value="preserve">Preserve Original Case</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mapping-mode" className="block text-sm font-medium mb-2">
              Mapping Mode
            </Label>
            <Select 
              value={mappingMode} 
              onValueChange={setMappingMode}
              data-testid="select-mapping-mode"
            >
              <SelectTrigger id="mapping-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="character">Character by Character</SelectItem>
                <SelectItem value="word">Word Replacement</SelectItem>
                <SelectItem value="pattern">Pattern Matching</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="output-format" className="block text-sm font-medium mb-2">
              Output Format
            </Label>
            <Select 
              value={outputFormat} 
              onValueChange={setOutputFormat}
              data-testid="select-output-format"
            >
              <SelectTrigger id="output-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain Text</SelectItem>
                <SelectItem value="unicode">Unicode</SelectItem>
                <SelectItem value="html">HTML Entities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Actions</Label>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                className="flex-1" 
                onClick={handleReset}
                data-testid="button-reset-options"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button 
                variant="default" 
                className="flex-1" 
                onClick={handleApply}
                disabled={updateConfigMutation.isPending}
                data-testid="button-apply-options"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
