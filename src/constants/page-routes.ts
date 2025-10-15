export const PageRoutes = {
  // Public routes
  HOME: "/",
  PROPERTIES: "/properties",

  // Landlord routes
  LANDLORD_REGISTER: "/landlord/register",
  LANDLORD_DASHBOARD: "/landlord/dashboard",
  LANDLORD_CREATE_PROPERTY: "/landlord/properties/new",

  // Tenant routes
  TENANT_DASHBOARD: "/tenant/dashboard",

  // Booking routes
  BOOKING: (propertyId: string) => `/booking/${propertyId}`,
  BOOKING_CONFIRMATION: "/booking/confirmation",

  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const

export type PageRoute = (typeof PageRoutes)[keyof typeof PageRoutes]
