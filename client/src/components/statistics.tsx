import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MappingRule, MappingConfiguration } from "@shared/schema";
import { ArrowLeftRight, Type, Clock, FileText } from "lucide-react";

export function Statistics() {
  const { data: mappingRules = [] } = useQuery<MappingRule[]>({
    queryKey: ["/api/mapping-rules"],
  });

  const { data: configurations = [] } = useQuery<MappingConfiguration[]>({
    queryKey: ["/api/mapping-configurations"],
  });

  const activeMappings = mappingRules.filter(rule => rule.isActive).length;
  const totalCharacters = 0; // This would be tracked in a real app
  const configFiles = configurations.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground" data-testid="stat-active-mappings">
                {activeMappings}
              </p>
              <p className="text-xs text-muted-foreground">Active Mappings</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-accent/10 p-2 rounded-lg mr-3">
              <Type className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground" data-testid="stat-characters-converted">
                {totalCharacters}
              </p>
              <p className="text-xs text-muted-foreground">Characters Converted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">Real-time</p>
              <p className="text-xs text-muted-foreground">Conversion Speed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-2 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground" data-testid="stat-config-files">
                {configFiles}
              </p>
              <p className="text-xs text-muted-foreground">Config Files Loaded</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
