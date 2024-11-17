import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"

// Add proper type definitions for props
interface NewCompositeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  operatorTitle: string
  operatorId: string
  witnessTitle: string
  witnessFirstName: string
  witnessLastName: string
  gender: string
  ethnicity: string
  ageRange: string
  notes: string
  isOver17: string
  suspectDescriptionRecorded: string
  suspectKnownAvailable: string
}

export function NewCompositeDialog({ open, onOpenChange }: NewCompositeDialogProps) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    operatorTitle: '',
    operatorId: '',
    witnessTitle: '',
    witnessFirstName: '',
    witnessLastName: '',
    gender: '',
    ethnicity: '',
    ageRange: '',
    notes: '',
    isOver17: 'yes',
    suspectDescriptionRecorded: 'no',
    suspectKnownAvailable: 'no'
  })

  const handleSubmit = () => {
    console.log('Form submitted:', formData)
    onOpenChange(false)
    navigate('/composite-builder')
  }

  const handleCancel = () => {
    setFormData({ // Reset form
      operatorTitle: '',
      operatorId: '',
      witnessTitle: '',
      witnessFirstName: '',
      witnessLastName: '',
      gender: '',
      ethnicity: '',
      ageRange: '',
      notes: '',
      isOver17: 'yes',
      suspectDescriptionRecorded: 'no',
      suspectKnownAvailable: 'no'
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-muted/30
        [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:border-2
        [&::-webkit-scrollbar-thumb]:border-background
        [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30
        hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30
        ">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Composite</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Operator Details - now with better spacing and visual hierarchy */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Operator Details</h3>
              <Badge variant="outline">Step 1 of 4</Badge>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Title</Label>
                <Input placeholder="PO1" />
              </div>
              <div className="col-span-2">
                <Label>ID Number</Label>
                <Input placeholder="Badge number" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">Lock</Button>
              </div>
            </div>
          </div>

          {/* Witness Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Witness Details</h3>
              <Badge variant="outline">Step 2 of 4</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Title</Label>
                <Input />
              </div>
              <div>
                <Label>First Name</Label>
                <Input />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input />
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Incident Details</h3>
              <Badge variant="outline">Step 3 of 4</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Gender</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ethnicity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tagalog">Tagalog</SelectItem>
                    <SelectItem value="cebuano">Cebuano</SelectItem>
                    <SelectItem value="ilocano">Ilocano</SelectItem>
                    {/* Add more Filipino ethnicities */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Age Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46+">46+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional details about the incident..." />
            </div>
          </div>

          {/* Additional Questions */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Verification Questions</h3>
              <Badge variant="outline">Step 4 of 4</Badge>
            </div>
            
            <div className="grid gap-6">
              {/* Existing question */}
              <div className="space-y-3">
                <Label className="text-base">
                  Is the witness over 17 years old OR is there a suitable guardian present?
                </Label>
                <RadioGroup 
                  value={formData.isOver17}
                  onValueChange={(value) => setFormData({...formData, isOver17: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes1" />
                    <Label htmlFor="yes1">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no1" />
                    <Label htmlFor="no1">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* New questions */}
              <div className="space-y-3">
                <Label className="text-base">
                  Has the first description of the suspect been recorded?
                </Label>
                <RadioGroup 
                  value={formData.suspectDescriptionRecorded}
                  onValueChange={(value) => setFormData({...formData, suspectDescriptionRecorded: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes2" />
                    <Label htmlFor="yes2">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no2" />
                    <Label htmlFor="no2">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Is the suspect known and available?
                </Label>
                <RadioGroup 
                  value={formData.suspectKnownAvailable}
                  onValueChange={(value) => setFormData({...formData, suspectKnownAvailable: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes3" />
                    <Label htmlFor="yes3">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no3" />
                    <Label htmlFor="no3">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!formData.isOver17 || formData.suspectDescriptionRecorded === 'no'}
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 