import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MappingRule } from "@shared/schema";
import { Copy, Download, RotateCcw, CheckCircle, Upload } from "lucide-react";
import { convertText, getTextStatistics, exportToFile } from "@/lib/mapping-utils";

export function TextConversionArea() {
  const [sourceText, setSourceText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const { data: mappingRules = [] } = useQuery<MappingRule[]>({
    queryKey: ["/api/mapping-rules"],
  });

  // Real-time conversion
  useEffect(() => {
    const converted = convertText(sourceText, mappingRules);
    setConvertedText(converted);
  }, [sourceText, mappingRules]);

  const sourceStats = getTextStatistics(sourceText);
  const convertedStats = getTextStatistics(convertedText);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(convertedText);
      toast({
        title: "Text copied successfully!",
        description: "Converted text is now in your clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    exportToFile(convertedText, `converted-text-${timestamp}.txt`);
    toast({
      title: "Text exported",
      description: "Converted text has been downloaded as a file",
    });
  };

  const handleClear = () => {
    setSourceText("");
    setConvertedText("");
  };

  const processFile = (file: File) => {
    // Check if file is a text file
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file (.txt)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSourceText(content);
      toast({
        title: "File uploaded successfully",
        description: `Loaded ${file.name} for conversion`,
      });
    };
    reader.onerror = () => {
      toast({
        title: "Failed to read file",
        description: "Could not read the uploaded file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    processFile(file);
    
    // Reset file input
    event.target.value = '';
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
      processFile(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Source Text Panel */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold">Source Text</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground" data-testid="text-source-length">
                {sourceStats.characters}
              </span>
              <span className="text-xs text-muted-foreground">characters</span>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt,text/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  data-testid="input-file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="button-upload-file"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClear}
                data-testid="button-clear-source"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            className={`relative ${isDragOver ? 'bg-primary/5' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className={`w-full h-64 p-4 bg-background border-0 resize-none focus:ring-2 focus:ring-ring focus:border-ring outline-none font-mono text-sm leading-relaxed rounded-none ${
                isDragOver ? 'border-2 border-dashed border-primary' : ''
              }`}
              placeholder="Type, paste, or drag a text file here..."
              data-testid="textarea-source-text"
            />
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-primary font-medium">Drop your text file here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Type, paste, upload, or drag & drop a text file to convert</span>
            <div className="flex items-center space-x-4">
              <span data-testid="text-source-words">{sourceStats.words} words</span>
              <span data-testid="text-source-lines">{sourceStats.lines} lines</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Converted Text Panel */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-semibold">Converted Text</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCopyToClipboard}
                disabled={!convertedText}
                data-testid="button-copy-text"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!convertedText}
                data-testid="button-export-text"
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div
            className="w-full h-64 p-4 bg-muted/30 border border-border rounded-md font-mono text-sm leading-relaxed overflow-auto whitespace-pre-wrap"
            data-testid="text-converted-output"
          >
            {convertedText || (
              <span className="text-muted-foreground italic">
                Converted text will appear here...
              </span>
            )}
          </div>
        </CardContent>
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span data-testid="text-conversion-status">
              {sourceText ? "Real-time conversion enabled" : "Enter text to start conversion"}
            </span>
            <div className="flex items-center space-x-4">
              <span data-testid="text-converted-words">{convertedStats.words} words converted</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Synced
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
