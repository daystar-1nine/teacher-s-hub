import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Loader2, Download, Printer } from 'lucide-react';

export default function QuestionPaper() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    topic: '',
    className: '',
    difficulty: 'medium',
    totalMarks: 100,
    mcqCount: 10,
    shortCount: 5,
    longCount: 2
  });
  const [questions, setQuestions] = useState<any[]>([]);

  const generatePaper = async () => {
    if (!form.subject || !form.className) {
      toast.error('Please fill in subject and class');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-question-paper', {
        body: {
          subject: form.subject,
          topic: form.topic,
          className: form.className,
          difficulty: form.difficulty,
          totalMarks: form.totalMarks,
          questionTypes: { mcq: form.mcqCount, short: form.shortCount, long: form.longCount }
        }
      });

      if (error) throw error;
      setQuestions(data.questions || []);
      toast.success('Question paper generated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Question Paper Generator</h1>
            <p className="text-muted-foreground">Generate exam papers with AI</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Mathematics" /></div>
              <div><Label>Topic (Optional)</Label><Input value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} placeholder="Algebra" /></div>
              <div><Label>Class</Label><Input value={form.className} onChange={e => setForm({...form, className: e.target.value})} placeholder="10th Grade" /></div>
              <div><Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generatePaper} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : <><FileText className="mr-2 h-4 w-4" />Generate Paper</>}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-card lg:col-span-2">
            <CardHeader><CardTitle>Generated Questions</CardTitle></CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Configure and generate to see questions</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {questions.map((q, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <Badge>{q.type?.toUpperCase()}</Badge>
                        <Badge variant="outline">{q.marks} marks</Badge>
                      </div>
                      <p className="font-medium mb-2">Q{i+1}. {q.question}</p>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {q.options.map((opt: string, j: number) => (
                            <div key={j} className={`p-2 rounded ${opt === q.correct_answer ? 'bg-success/20 border-success' : 'bg-muted'}`}>
                              {String.fromCharCode(65+j)}) {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
