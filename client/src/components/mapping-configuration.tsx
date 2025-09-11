import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MappingRule, InsertMappingRule } from "@shared/schema";
import { Plus, Upload, Trash2, ArrowRight, Download, AlertTriangle } from "lucide-react";
import { parseImportFile } from "@/lib/mapping-utils";
import { GujaratiCharacterSelector } from "./gujarati-character-selector";

export function MappingConfiguration() {
  const [newRule, setNewRule] = useState({ sourceChar: "", targetChar: "" });
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mappingRules = [], isLoading } = useQuery<MappingRule[]>({
    queryKey: ["/api/mapping-rules"],
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: InsertMappingRule) => {
      const response = await apiRequest("POST", "/api/mapping-rules", rule);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-rules"] });
      setNewRule({ sourceChar: "", targetChar: "" });
      toast({
        title: "Rule added",
        description: "Character mapping rule has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create mapping rule.",
        variant: "destructive",
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ id, rule }: { id: string; rule: Partial<InsertMappingRule> }) => {
      const response = await apiRequest("PUT", `/api/mapping-rules/${id}`, rule);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-rules"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mapping rule.",
        variant: "destructive",
      });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/mapping-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-rules"] });
      toast({
        title: "Rule deleted",
        description: "Character mapping rule has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mapping rule.",
        variant: "destructive",
      });
    },
  });

  const clearAllRulesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/mapping-rules");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-rules"] });
      toast({
        title: "All rules cleared",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear all mapping rules.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/mapping-rules/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Import failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mapping-rules"] });
      toast({
        title: "Import successful",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Import failed",
        description: "Failed to import mapping file.",
        variant: "destructive",
      });
    },
  });

  const handleAddRule = () => {
    if (newRule.sourceChar && newRule.targetChar) {
      createRuleMutation.mutate({
        sourceChar: newRule.sourceChar,
        targetChar: newRule.targetChar,
        caseSensitive: true,
        isActive: true,
      });
    }
  };

  const handleUpdateRule = (id: string, field: keyof InsertMappingRule, value: string) => {
    updateRuleMutation.mutate({
      id,
      rule: { [field]: value },
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file type
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.json') || fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        importMutation.mutate(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JSON, CSV, or TXT file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportRules = () => {
    if (mappingRules.length === 0) {
      toast({
        title: "No rules to export",
        description: "Please add some mapping rules first.",
        variant: "destructive",
      });
      return;
    }

    const exportData = {
      rules: mappingRules.map(rule => ({
        sourceChar: rule.sourceChar,
        targetChar: rule.targetChar,
        caseSensitive: rule.caseSensitive,
        isActive: rule.isActive,
      })),
      configuration: {
        name: "Exported Mapping Rules",
        description: `Exported ${mappingRules.length} mapping rules on ${new Date().toLocaleDateString()}`,
        caseSensitivity: "sensitive",
        mappingMode: "character",
        outputFormat: "plain",
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapping-rules-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Rules exported",
      description: `Successfully exported ${mappingRules.length} mapping rules.`,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Character Mapping Rules</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddRule}
              disabled={!newRule.sourceChar || !newRule.targetChar || createRuleMutation.isPending}
              data-testid="button-add-rule"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="button-import">
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                Import
                <input
                  type="file"
                  className="hidden"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  data-testid="input-file-upload"
                />
              </label>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportRules}
              disabled={mappingRules.length === 0}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                if (mappingRules.length === 0) {
                  toast({
                    title: "No rules to clear",
                    description: "There are no mapping rules to delete.",
                    variant: "destructive",
                  });
                  return;
                }
                if (confirm(`Are you sure you want to delete all ${mappingRules.length} mapping rules? This action cannot be undone.`)) {
                  clearAllRulesMutation.mutate();
                }
              }}
              disabled={mappingRules.length === 0 || clearAllRulesMutation.isPending}
              data-testid="button-clear-all"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          data-testid="drop-zone"
        >
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">
            Drop mapping files here or{" "}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <input
                type="file"
                className="hidden"
                accept=".json,.csv,.txt"
                onChange={handleFileUpload}
                data-testid="input-file-drop"
              />
            </label>
          </p>
          <p className="text-xs text-muted-foreground">Supports JSON, CSV, and TXT formats</p>
        </div>

        {/* Add New Rule */}
        <div className="flex items-center space-x-3 p-3 bg-muted rounded-md border border-border">
          <Input
            type="text"
            value={newRule.sourceChar}
            onChange={(e) => setNewRule({ ...newRule, sourceChar: e.target.value })}
            className="w-16 text-center font-mono"
            placeholder="s"
            data-testid="input-source-char"
          />
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <GujaratiCharacterSelector
            value={newRule.targetChar}
            onChange={(value) => setNewRule({ ...newRule, targetChar: value })}
            placeholder="ક"
            testId="input-target-char"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRule}
            disabled={!newRule.sourceChar || !newRule.targetChar || createRuleMutation.isPending}
            data-testid="button-create-rule"
          >
            Add
          </Button>
        </div>

        {/* Mapping Rules Display */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">Loading mapping rules...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mappingRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center space-x-3 p-3 bg-muted rounded-md border border-border"
                data-testid={`rule-${rule.id}`}
              >
                <Input
                  type="text"
                  value={rule.sourceChar}
                  onChange={(e) => handleUpdateRule(rule.id, "sourceChar", e.target.value)}
                  className="w-16 text-center bg-background border border-border rounded text-sm font-mono"
                  data-testid={`input-source-${rule.id}`}
                />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <GujaratiCharacterSelector
                  value={rule.targetChar}
                  onChange={(value) => handleUpdateRule(rule.id, "targetChar", value)}
                  testId={`input-target-${rule.id}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRuleMutation.mutate(rule.id)}
                  className="text-destructive hover:text-destructive/80"
                  data-testid={`button-delete-${rule.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {mappingRules.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            No mapping rules configured. Add your first rule above or import from a file.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
