import { 
  BarChart3, ArrowUpRight, Users, FileText, 
  Clock, AlertCircle, Activity, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Overview() {
  const stats = [
    {
      title: "Active Cases",
      value: "12",
      change: "+2",
      icon: FileText,
    },
    {
      title: "Team Members",
      value: "24",
      change: "+4",
      icon: Users,
    },
    {
      title: "Composites Created",
      value: "284",
      change: "+12",
      icon: Activity,
    },
    {
      title: "Avg. Completion Time",
      value: "1.2h",
      change: "-18m",
      icon: Clock,
    },
  ]

  const recentActivity = [
    {
      user: "John D.",
      action: "Created new composite",
      target: "Robbery Case #123",
      time: "2 hours ago",
      priority: "high"
    },
    {
      user: "Sarah M.",
      action: "Updated composite",
      target: "Assault Case #456",
      time: "4 hours ago",
      priority: "medium"
    },
    {
      user: "Mike R.",
      action: "Added new features",
      target: "Feature Database",
      time: "5 hours ago",
      priority: "low"
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your cases.
          </p>
        </div>
        <Select defaultValue="today">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{activity.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                      <Badge variant={
                        activity.priority === 'high' ? 'destructive' : 
                        activity.priority === 'medium' ? 'default' : 
                        'secondary'
                      }>
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Alerts & Notifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-sm font-medium">High Priority Case Update Required</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Case #123 needs immediate attention. Last updated 5 days ago.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <p className="text-sm font-medium">New Feature Database Updates</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  15 new facial features have been added to the database.
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <p className="text-sm font-medium">Team Meeting Reminder</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weekly case review meeting tomorrow at 10:00 AM.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 