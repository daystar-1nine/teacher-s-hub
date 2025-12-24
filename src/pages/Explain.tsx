import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  Lightbulb,
  ListOrdered,
  GraduationCap,
  Zap,
  Target,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface Explanation {
  topic: string;
  mode: string;
  explanation: string;
  examples: string[];
  steps: string[];
  timestamp: Date;
}

export default function Explain() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'beginner' | 'intermediate' | 'exam-focused'>('beginner');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState<Explanation | null>(null);
  const [history, setHistory] = useState<Explanation[]>([]);

  const modeConfig = {
    beginner: {
      icon: GraduationCap,
      label: 'Beginner',
      description: 'Simple language, basic concepts',
      color: 'bg-success/10 text-success',
    },
    intermediate: {
      icon: Zap,
      label: 'Intermediate',
      description: 'Detailed explanation with context',
      color: 'bg-warning/10 text-warning',
    },
    'exam-focused': {
      icon: Target,
      label: 'Exam Focused',
      description: 'Key points, formulas, exam tips',
      color: 'bg-primary/10 text-primary',
    },
  };

  const generateExplanation = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('explain-topic', {
        body: { topic, mode }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error(error.message || 'Failed to generate explanation');
        setIsLoading(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      const explanation: Explanation = {
        topic: data.topic,
        mode: data.mode,
        explanation: data.explanation,
        examples: data.examples || [],
        steps: data.steps || [],
        timestamp: new Date(),
      };

      setCurrentExplanation(explanation);
      setHistory(prev => [explanation, ...prev.slice(0, 9)]);
      toast.success('Explanation generated!');
    } catch (error) {
      console.error('Error generating explanation:', error);
      toast.error('Failed to generate explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentExplanation) return;
    
    const text = `
Topic: ${currentExplanation.topic}
Mode: ${currentExplanation.mode}

EXPLANATION:
${currentExplanation.explanation}

EXAMPLES:
${currentExplanation.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}

STEP-BY-STEP:
${currentExplanation.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Topic Explainer
          </h1>
          <p className="text-muted-foreground mt-1">
            Get clear, customized explanations powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Topic</CardTitle>
                <CardDescription>
                  What would you like to learn about?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Textarea
                    id="topic"
                    placeholder="e.g., Photosynthesis, Quadratic Equations, Newton's Laws..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Explanation Mode</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {(Object.keys(modeConfig) as Array<keyof typeof modeConfig>).map((m) => {
                      const config = modeConfig[m];
                      const Icon = config.icon;
                      const isSelected = mode === m;
                      
                      return (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-primary bg-primary/5' 
                              : 'border-transparent bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="gradient" 
                  size="lg"
                  onClick={generateExplanation}
                  disabled={isLoading || !topic.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Explain Topic
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Topics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-60 overflow-y-auto">
                    {history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setTopic(item.topic);
                          setMode(item.mode as any);
                          setCurrentExplanation(item);
                        }}
                        className="w-full p-3 text-left hover:bg-muted transition-colors"
                      >
                        <p className="font-medium truncate">{item.topic}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {modeConfig[item.mode as keyof typeof modeConfig]?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            {currentExplanation ? (
              <>
                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                  <Button variant="outline" onClick={generateExplanation}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>

                {/* Explanation */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Explanation
                      </CardTitle>
                      <Badge className={modeConfig[currentExplanation.mode as keyof typeof modeConfig]?.color}>
                        {modeConfig[currentExplanation.mode as keyof typeof modeConfig]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold mb-3">{currentExplanation.topic}</h3>
                      <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {currentExplanation.explanation}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Examples */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-warning" />
                      Examples
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentExplanation.examples.map((example, index) => (
                        <div 
                          key={index}
                          className="p-4 rounded-lg bg-warning/5 border border-warning/20"
                        >
                          <p className="text-sm leading-relaxed">{example}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListOrdered className="w-5 h-5 text-success" />
                      Step-by-Step Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentExplanation.steps.map((step, index) => (
                        <div 
                          key={index}
                          className="flex gap-4 p-3 rounded-lg bg-success/5"
                        >
                          <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center font-semibold shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold text-muted-foreground">Ready to Learn</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Enter a topic and select your preferred explanation mode to get started.
                    The AI will generate a customized explanation just for you.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
