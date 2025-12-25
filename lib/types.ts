export type UserRole = "super_admin" | "field_admin"

export type EngineeringField =
  | "Computer Engineering"
  | "Electrical Engineering"
  | "Electronics Engineering"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Chemical Engineering"
  | "Material Engineering"
  | "Mining Engineering"
  | "Textile Engineering"

export const ENGINEERING_FIELDS: EngineeringField[] = [
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical Engineering",
  "Electronics Engineering",
  "Material Engineering",
  "Mechanical Engineering",
  "Mining Engineering",
  "Textile Engineering",
]

export interface User {
  id: string
  email: string
  username: string
  role: UserRole
  assignedField?: EngineeringField
  createdAt: string
}

export interface Batchmate {
  id: string
  documentId?: string
  callingName: string
  fullName: string
  whatsappMobile: string
  email: string
  nickName?: string
  address?: string
  country?: string
  workingPlace?: string
  mobile?: string
  universityPhoto?: string
  currentPhoto?: string
  field: EngineeringField
  phoneConfirmation?: "Yes" | "No"
  attendance?: "Present" | "Absent"
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  email: string
  username: string
  role: UserRole
  assignedField?: EngineeringField
}

export const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Kuwait",
  "Lebanon",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "UAE",
  "UK",
  "Ukraine",
  "USA",
  "Vietnam",
  "Other",
]
