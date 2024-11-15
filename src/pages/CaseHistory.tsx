import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, Filter, Clock, Users, Calendar,
  FileText, CheckCircle2, XCircle, AlertCircle,
  Download, ArrowUpDown
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table"

export default function CaseHistory() {
  const cases = [
    {
      id: "CASE-001",
      title: "Downtown Bank Robbery",
      type: "Robbery",
      status: "Solved",
      outcome: "Arrest Made",
      priority: "high",
      assignedTo: [
        { name: "John D.", initial: "JD" },
        { name: "Sarah M.", initial: "SM" }
      ],
      closedDate: "2024-02-15",
      duration: "45 days",
      composites: 3,
      description: "Armed robbery at First National Bank. Suspect apprehended based on composite match."
    },
    {
      id: "CASE-002",
      title: "Mall Assault Case",
      type: "Assault",
      status: "Closed",
      outcome: "Insufficient Evidence",
      priority: "medium",
      assignedTo: [
        { name: "Mike R.", initial: "MR" }
      ],
      closedDate: "2024-02-10",
      duration: "30 days",
      composites: 1,
      description: "Physical assault at Central Mall. Case closed due to lack of evidence."
    },
    // Add more cases as needed
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Case History</h1>
          <p className="text-muted-foreground">
            Review and analyze closed cases
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Report
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
            <SelectValue placeholder="Filter by outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="solved">Solved</SelectItem>
            <SelectItem value="unsolved">Unsolved</SelectItem>
            <SelectItem value="insufficient">Insufficient Evidence</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="robbery">Robbery</SelectItem>
            <SelectItem value="assault">Assault</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cases Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Case ID</TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-4">
                  Title <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Closed Date</TableHead>
              <TableHead>Composites</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((case_) => (
              <TableRow key={case_.id} className="group">
                <TableCell className="font-medium">{case_.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{case_.title}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {case_.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{case_.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {case_.outcome === "Arrest Made" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : case_.outcome === "Insufficient Evidence" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span>{case_.outcome}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {case_.duration}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {case_.closedDate}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {case_.composites}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {case_.assignedTo.map((person, i) => (
                      <Avatar key={i} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback>{person.initial}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 