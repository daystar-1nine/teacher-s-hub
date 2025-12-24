import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapData {
  subject: string;
  months: { month: string; value: number }[];
}

interface PerformanceHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

const getColorClass = (value: number): string => {
  if (value >= 90) return 'bg-success';
  if (value >= 75) return 'bg-success/70';
  if (value >= 60) return 'bg-warning';
  if (value >= 40) return 'bg-warning/70';
  return 'bg-destructive';
};

const getTextClass = (value: number): string => {
  return 'text-white';
};

export function PerformanceHeatmap({ data, title = 'Performance Heatmap' }: PerformanceHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No performance data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const months = data[0]?.months.map(m => m.month) || [];

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span>&lt;40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-warning" />
              <span>40-74%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success" />
              <span>&gt;75%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">
                  Subject
                </th>
                {months.map((month) => (
                  <th 
                    key={month} 
                    className="text-center text-xs font-medium text-muted-foreground pb-2 px-1"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TooltipProvider>
                {data.map((row) => (
                  <tr key={row.subject}>
                    <td className="text-sm font-medium py-1 pr-4 whitespace-nowrap">
                      {row.subject}
                    </td>
                    {row.months.map((cell, idx) => (
                      <td key={idx} className="p-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${getColorClass(cell.value)} ${getTextClass(cell.value)}`}
                            >
                              <span className="text-xs font-semibold">{cell.value}%</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{row.subject}</p>
                            <p className="text-xs text-muted-foreground">{cell.month}: {cell.value}% average</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </TooltipProvider>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
