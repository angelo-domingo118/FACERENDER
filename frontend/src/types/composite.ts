interface Composite {
  id: string
  operatorDetails: {
    title: string
    idNumber: string
  }
  witnessDetails: {
    title: string
    firstName: string
    lastName: string
  }
  incidentDetails: {
    gender: string
    ethnicity: string
    ageRange: string
    notes: string
  }
  createdAt: Date
  // ... other fields
} 