import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, Filter, Clock, Users, 
  MoreHorizontal, FileText, AlertCircle,
  Calendar, ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ActiveCases() {
  const cases = [
    {
      id: "CASE-123",
      title: "Downtown Bank Robbery",
      type: "Robbery",
      status: "In Progress",
      priority: "high",
      progress: 65,
      assignedTo: [
        { name: "John D.", initial: "JD" },
        { name: "Sarah M.", initial: "SM" }
      ],
      lastUpdated: "2 hours ago",
      dueDate: "2024-03-20",
      composites: 2,
      description: "Armed robbery at First National Bank on Main Street"
    },
    // Add more cases for testing
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Cases</h1>
          <p className="text-muted-foreground">
            Manage and track ongoing investigations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Case
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search cases..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cases</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cases.map((case_) => (
          <Card key={case_.id} className="relative group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      case_.priority === 'high' ? 'destructive' : 
                      case_.priority === 'medium' ? 'default' : 
                      'secondary'
                    }>
                      {case_.priority} Priority
                    </Badge>
                    <Badge variant="outline">{case_.type}</Badge>
                  </div>
                  <CardTitle className="mt-2 text-xl">{case_.title}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Case</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuItem>Change Priority</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Archive Case
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {case_.description}
              </p>
              
              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Case Progress</span>
                  <span className="text-muted-foreground">{case_.progress}%</span>
                </div>
                <Progress value={case_.progress} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{case_.composites} Composites</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{case_.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due {case_.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{case_.assignedTo.length} Assigned</span>
                </div>
              </div>

              {/* Assigned Officers */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  {case_.assignedTo.map((person, i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-background">
                      <AvatarFallback>{person.initial}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  View Details <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 