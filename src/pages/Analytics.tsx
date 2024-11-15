import { 
  BarChart3, LineChart, PieChart, ArrowUpRight, 
  ArrowDownRight, Users, FileText, Clock, 
  Download, Filter, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Analytics() {
  const metrics = [
    {
      title: "Total Cases",
      value: "296",
      change: "+12%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Avg Resolution Time",
      value: "18.5 days",
      change: "-8%",
      trend: "down",
      period: "vs last month"
    },
    {
      title: "Success Rate",
      value: "76%",
      change: "+5%",
      trend: "up",
      period: "vs last month"
    },
    {
      title: "Active Users",
      value: "24",
      change: "0%",
      trend: "neutral",
      period: "vs last month"
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : metric.trend === 'down' ? (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.trend === 'up' ? 'text-green-500' : 
                               metric.trend === 'down' ? 'text-red-500' : ''}>
                  {metric.change}
                </span>
                {' '}{metric.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Case Resolution Timeline */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Case Resolution Timeline</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">Chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Case Types Distribution */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Case Types Distribution</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">Chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Success Rate */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Monthly Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">Chart placeholder</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Team Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">Chart placeholder</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 