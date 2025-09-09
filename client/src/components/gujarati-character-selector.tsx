
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getCharactersByCategory } from "@/lib/gujarati-characters";
import { ChevronDown } from "lucide-react";

interface GujaratiCharacterSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  testId?: string;
}

export function GujaratiCharacterSelector({ 
  value, 
  onChange, 
  placeholder = "ક", 
  testId 
}: GujaratiCharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const characters = getCharactersByCategory();

  const handleCharacterSelect = (char: string) => {
    onChange(char);
    setIsOpen(false);
  };

  return (
    <div className="flex space-x-1">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 text-center font-mono"
        placeholder={placeholder}
        data-testid={testId}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            data-testid={`${testId}-selector`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <Tabs defaultValue="consonants" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="consonants" className="text-xs">વ્યંજન</TabsTrigger>
              <TabsTrigger value="vowels" className="text-xs">સ્વર</TabsTrigger>
              <TabsTrigger value="numbers" className="text-xs">સંખ્યા</TabsTrigger>
              <TabsTrigger value="punctuation" className="text-xs">વિરામ</TabsTrigger>
              <TabsTrigger value="special" className="text-xs">વિશેષ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="consonants" className="mt-3">
              <div className="grid grid-cols-7 gap-1">
                {characters.consonants.map((char) => (
                  <Button
                    key={char}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-sm font-mono hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleCharacterSelect(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="vowels" className="mt-3">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">સ્વર</p>
                  <div className="grid grid-cols-6 gap-1">
                    {characters.vowels.map((char) => (
                      <Button
                        key={char}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-sm font-mono hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleCharacterSelect(char)}
                      >
                        {char}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">માત્રા</p>
                  <div className="grid grid-cols-6 gap-1">
                    {characters.vowelSigns.map((char) => (
                      <Button
                        key={char}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-sm font-mono hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleCharacterSelect(char)}
                      >
                        {char}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="numbers" className="mt-3">
              <div className="grid grid-cols-5 gap-1">
                {characters.numbers.map((char) => (
                  <Button
                    key={char}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-sm font-mono hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleCharacterSelect(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="punctuation" className="mt-3">
              <div className="grid grid-cols-8 gap-1">
                {characters.punctuation?.map((char) => (
                  <Button
                    key={char}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-sm font-mono hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleCharacterSelect(char)}
                  >
                    {char}
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="special" className="mt-3">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">સંયુક્ત અક્ષર</p>
                  <div className="grid grid-cols-4 gap-1">
                    {characters.compounds.map((char) => (
                      <Button
                        key={char}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-xs font-mono hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleCharacterSelect(char)}
                      >
                        {char}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">ચિહ્નો</p>
                  <div className="grid grid-cols-6 gap-1">
                    {characters.symbols.slice(0, 12).map((char) => (
                      <Button
                        key={char}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-xs font-mono hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleCharacterSelect(char)}
                      >
                        {char}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
