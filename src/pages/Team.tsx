import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, Search, Filter, Mail, Phone, 
  MoreHorizontal, Shield, Building2, MapPin,
  BadgeCheck, Clock, FileText, ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

export default function Team() {
  const teamMembers = [
    {
      id: "USR-001",
      name: "John Smith",
      role: "Detective",
      department: "Criminal Investigation",
      location: "Central Division",
      email: "john.smith@pd.gov",
      phone: "(555) 123-4567",
      status: "Active",
      badgeNumber: "12345",
      avatar: "/avatars/john.jpg",
      activeCases: 4,
      completedCases: 127,
      recentActivity: "2 hours ago",
      expertise: ["Facial Recognition", "Digital Forensics"],
      performance: 92
    },
    // Add more team members
  ]

  const departments = [
    "All Departments",
    "Criminal Investigation",
    "Forensics",
    "Special Victims",
    "Cyber Crime",
    "Homicide"
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage and collaborate with your team members
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Members</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Active Cases</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">Avg. Response Time</p>
              <p className="text-2xl font-bold">1.5h</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search team members..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept.toLowerCase()}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Team Members Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{member.name}</h3>
                      <BadgeCheck className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Assign Case</DropdownMenuItem>
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{member.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Performance</span>
                  <span className="text-muted-foreground">{member.performance}%</span>
                </div>
                <Progress value={member.performance} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Active Cases</p>
                    <p className="text-sm font-medium">{member.activeCases}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium">{member.completedCases}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-1">
                  {member.expertise.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="mr-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  Profile <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 