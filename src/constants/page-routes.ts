export const PageRoutes = {
  // Public routes
  HOME: "/",
  PROPERTIES: "/properties",
  PROFILE: "/profile",

  // Landlord routes
  LANDLORD_DASHBOARD: "/landlord/dashboard",
  LANDLORD_CREATE_PROPERTY: "/landlord/properties/new",
  LANDLORD_PROPERTY_CHECKOUT: "/landlord/properties/checkout",
LANDLORD_PROPERTY_CONFIRMATION: "/landlord/properties/confirmation",

  // Tenant routes
  TENANT_DASHBOARD: "/tenant/dashboard",

  // Booking routes
  BOOKING: (propertyId: string) => `/booking/${propertyId}`,
  BOOKING_CHECKOUT: "/booking/checkout",
  BOOKING_CONFIRMATION: "/booking/confirmation",

  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const

export type PageRoute = (typeof PageRoutes)[keyof typeof PageRoutes]
