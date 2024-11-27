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
  onSubmit?: (formData: FormData) => void
}

interface FormData {
  // Operator Details
  operatorRank: string
  operatorFirstName: string
  operatorLastName: string
  operatorBadgeNumber: string
  operatorUnit: string
  
  // Witness Details
  witnessFirstName: string
  witnessLastName: string
  witnessAge: string
  witnessContact: string
  witnessAddress: string
  
  // Updated Incident Details
  caseNumber: string
  incidentType: string
  incidentDate: string
  incidentTime: string
  incidentLocation: string
  suspectGender: string
  suspectEthnicity: string
  suspectAgeRange: string
  suspectHeight: string
  suspectBuild: string
  distinguishingFeatures: string
  incidentNotes: string
  
  // Updated Verification Questions
  witnessConsent: string
  witnessCredibility: string
  witnessSobriety: string
  initialStatementRecorded: string
  caseAssigned: string
}

export function NewCompositeDialog({ open, onOpenChange, onSubmit }: NewCompositeDialogProps) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData>({
    // Operator Details
    operatorRank: '',
    operatorFirstName: '',
    operatorLastName: '',
    operatorBadgeNumber: '',
    operatorUnit: '',
    
    // Witness Details
    witnessFirstName: '',
    witnessLastName: '',
    witnessAge: '',
    witnessContact: '',
    witnessAddress: '',
    
    // Updated Incident Details
    caseNumber: '',
    incidentType: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    suspectGender: '',
    suspectEthnicity: '',
    suspectAgeRange: '',
    suspectHeight: '',
    suspectBuild: '',
    distinguishingFeatures: '',
    incidentNotes: '',
    
    // Updated Verification Questions
    witnessConsent: 'yes',
    witnessCredibility: 'yes',
    witnessSobriety: 'yes',
    initialStatementRecorded: 'yes',
    caseAssigned: 'yes'
  })

  const handleSubmit = () => {
    // Call onSubmit if provided
    onSubmit?.(formData)
    
    // Reset form and close dialog
    resetForm()
    onOpenChange(false)
    
    // Navigate to composite builder instead of editor
    navigate('/composite-builder')
  }

  const handleCancel = () => {
    setFormData({ // Reset form
      operatorRank: '',
      operatorFirstName: '',
      operatorLastName: '',
      operatorBadgeNumber: '',
      operatorUnit: '',
      witnessFirstName: '',
      witnessLastName: '',
      witnessAge: '',
      witnessContact: '',
      witnessAddress: '',
      caseNumber: '',
      incidentType: '',
      incidentDate: '',
      incidentTime: '',
      incidentLocation: '',
      suspectGender: '',
      suspectEthnicity: '',
      suspectAgeRange: '',
      suspectHeight: '',
      suspectBuild: '',
      distinguishingFeatures: '',
      incidentNotes: '',
      witnessConsent: 'yes',
      witnessCredibility: 'yes',
      witnessSobriety: 'yes',
      initialStatementRecorded: 'yes',
      caseAssigned: 'yes'
    })
    onOpenChange(false)
  }

  const resetForm = () => {
    setFormData({
      operatorRank: '',
      operatorFirstName: '',
      operatorLastName: '',
      operatorBadgeNumber: '',
      operatorUnit: '',
      witnessFirstName: '',
      witnessLastName: '',
      witnessAge: '',
      witnessContact: '',
      witnessAddress: '',
      caseNumber: '',
      incidentType: '',
      incidentDate: '',
      incidentTime: '',
      incidentLocation: '',
      suspectGender: '',
      suspectEthnicity: '',
      suspectAgeRange: '',
      suspectHeight: '',
      suspectBuild: '',
      distinguishingFeatures: '',
      incidentNotes: '',
      witnessConsent: 'yes',
      witnessCredibility: 'yes',
      witnessSobriety: 'yes',
      initialStatementRecorded: 'yes',
      caseAssigned: 'yes'
    })
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
          {/* Operator Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Operator Details</h3>
              <Badge variant="outline">Step 1 of 4</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rank</Label>
                <Select 
                  value={formData.operatorRank}
                  onValueChange={(value) => setFormData({...formData, operatorRank: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="po1">PO1</SelectItem>
                    <SelectItem value="po2">PO2</SelectItem>
                    <SelectItem value="po3">PO3</SelectItem>
                    <SelectItem value="spo1">SPO1</SelectItem>
                    <SelectItem value="spo2">SPO2</SelectItem>
                    <SelectItem value="spo3">SPO3</SelectItem>
                    <SelectItem value="spo4">SPO4</SelectItem>
                    <SelectItem value="inspector">Inspector</SelectItem>
                    <SelectItem value="superintendent">Superintendent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Badge Number</Label>
                <Input 
                  placeholder="Enter badge number"
                  value={formData.operatorBadgeNumber}
                  onChange={(e) => setFormData({...formData, operatorBadgeNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>First Name</Label>
                <Input 
                  placeholder="Enter first name"
                  value={formData.operatorFirstName}
                  onChange={(e) => setFormData({...formData, operatorFirstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  placeholder="Enter last name"
                  value={formData.operatorLastName}
                  onChange={(e) => setFormData({...formData, operatorLastName: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Unit/Station</Label>
                <Input 
                  placeholder="Enter unit or station"
                  value={formData.operatorUnit}
                  onChange={(e) => setFormData({...formData, operatorUnit: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Witness Details */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Witness Details</h3>
              <Badge variant="outline">Step 2 of 4</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input 
                  placeholder="Enter first name"
                  value={formData.witnessFirstName}
                  onChange={(e) => setFormData({...formData, witnessFirstName: e.target.value})}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input 
                  placeholder="Enter last name"
                  value={formData.witnessLastName}
                  onChange={(e) => setFormData({...formData, witnessLastName: e.target.value})}
                />
              </div>
              <div>
                <Label>Age</Label>
                <Input 
                  type="number"
                  placeholder="Enter age"
                  value={formData.witnessAge}
                  onChange={(e) => setFormData({...formData, witnessAge: e.target.value})}
                />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input 
                  placeholder="Enter contact number"
                  value={formData.witnessContact}
                  onChange={(e) => setFormData({...formData, witnessContact: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <Textarea 
                  placeholder="Enter complete address"
                  value={formData.witnessAddress}
                  onChange={(e) => setFormData({...formData, witnessAddress: e.target.value})}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Incident Details Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Incident Details</h3>
              <Badge variant="outline">Step 3 of 4</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Case Number</Label>
                <Input 
                  placeholder="Enter case number"
                  value={formData.caseNumber}
                  onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                />
              </div>
              <div>
                <Label>Incident Type</Label>
                <Select 
                  value={formData.incidentType}
                  onValueChange={(value) => setFormData({...formData, incidentType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="robbery">Robbery</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="assault">Assault</SelectItem>
                    <SelectItem value="homicide">Homicide</SelectItem>
                    <SelectItem value="kidnapping">Kidnapping</SelectItem>
                    <SelectItem value="sexual-assault">Sexual Assault</SelectItem>
                    <SelectItem value="missing-person">Missing Person</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Incident Date</Label>
                <Input 
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Incident Time</Label>
                <Input 
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => setFormData({...formData, incidentTime: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <Label>Incident Location</Label>
                <Textarea 
                  placeholder="Enter complete incident location"
                  value={formData.incidentLocation}
                  onChange={(e) => setFormData({...formData, incidentLocation: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Suspect Gender</Label>
                <Select 
                  value={formData.suspectGender}
                  onValueChange={(value) => setFormData({...formData, suspectGender: value})}
                >
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
                <Label>Suspect Ethnicity</Label>
                <Select 
                  value={formData.suspectEthnicity}
                  onValueChange={(value) => setFormData({...formData, suspectEthnicity: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tagalog">Tagalog</SelectItem>
                    <SelectItem value="cebuano">Cebuano</SelectItem>
                    <SelectItem value="ilocano">Ilocano</SelectItem>
                    <SelectItem value="bicolano">Bicolano</SelectItem>
                    <SelectItem value="waray">Waray</SelectItem>
                    <SelectItem value="kapampangan">Kapampangan</SelectItem>
                    <SelectItem value="chinese-filipino">Chinese Filipino</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Suspect Age Range</Label>
                <Select 
                  value={formData.suspectAgeRange}
                  onValueChange={(value) => setFormData({...formData, suspectAgeRange: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Below 18</SelectItem>
                    <SelectItem value="18-25">18-25</SelectItem>
                    <SelectItem value="26-35">26-35</SelectItem>
                    <SelectItem value="36-45">36-45</SelectItem>
                    <SelectItem value="46-55">46-55</SelectItem>
                    <SelectItem value="56+">56 and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Suspect Height (cm)</Label>
                <Input 
                  type="number"
                  placeholder="Height in cm"
                  value={formData.suspectHeight}
                  onChange={(e) => setFormData({...formData, suspectHeight: e.target.value})}
                />
              </div>
              <div>
                <Label>Body Build</Label>
                <Select 
                  value={formData.suspectBuild}
                  onValueChange={(value) => setFormData({...formData, suspectBuild: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select build" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                    <SelectItem value="muscular">Muscular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Distinguishing Features</Label>
              <Textarea 
                placeholder="Scars, tattoos, birthmarks, etc."
                value={formData.distinguishingFeatures}
                onChange={(e) => setFormData({...formData, distinguishingFeatures: e.target.value})}
                rows={2}
              />
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Any other relevant details about the incident or suspect..."
                value={formData.incidentNotes}
                onChange={(e) => setFormData({...formData, incidentNotes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          {/* Verification Questions */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Verification Questions</h3>
              <Badge variant="outline">Step 4 of 4</Badge>
            </div>
            
            <div className="grid gap-6">
              <div className="space-y-3">
                <Label className="text-base">
                  Has the witness given consent for the composite sketch procedure?
                </Label>
                <RadioGroup 
                  value={formData.witnessConsent}
                  onValueChange={(value) => setFormData({...formData, witnessConsent: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="consent-yes" />
                    <Label htmlFor="consent-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="consent-no" />
                    <Label htmlFor="consent-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Has the witness's initial statement been recorded in the police blotter?
                </Label>
                <RadioGroup 
                  value={formData.initialStatementRecorded}
                  onValueChange={(value) => setFormData({...formData, initialStatementRecorded: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="statement-yes" />
                    <Label htmlFor="statement-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="statement-no" />
                    <Label htmlFor="statement-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Was the witness sober and in a proper state of mind during the incident?
                </Label>
                <RadioGroup 
                  value={formData.witnessSobriety}
                  onValueChange={(value) => setFormData({...formData, witnessSobriety: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sober-yes" />
                    <Label htmlFor="sober-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sober-no" />
                    <Label htmlFor="sober-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">
                  Has this case been assigned to an investigating officer?
                </Label>
                <RadioGroup 
                  value={formData.caseAssigned}
                  onValueChange={(value) => setFormData({...formData, caseAssigned: value})}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="assigned-yes" />
                    <Label htmlFor="assigned-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="assigned-no" />
                    <Label htmlFor="assigned-no">No</Label>
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
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 