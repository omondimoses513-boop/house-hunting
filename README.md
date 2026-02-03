This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Tyrent House Hunting - Backend API Documentation

**Frontend Repository:** [Mosesomo/tyrent-house-hunting](https://github.com/Mosesomo/tyrent-house-hunting)  
**Technology Stack:** REST API, JSON, JWT Authentication  
**Target Platform:** Next.js Frontend (TypeScript, Tailwind CSS)  
**Date:** February 3, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Core Data Models](#core-data-models)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Authentication & Authorization](#authentication--authorization)
5. [Database Schema Suggestions](#database-schema-suggestions)
6. [Implementation Checklist](#implementation-checklist)
7. [Integration Notes](#integration-notes)
8. [Error Handling Standards](#error-handling-standards)
9. [Rate Limiting Recommendations](#rate-limiting-recommendations)
10. [Deployment Considerations](#deployment-considerations)

---

## Overview

The Tyrent House Hunting platform is a comprehensive rental property management system that connects tenants with landlords in Kenya. The backend API serves a Next.js frontend application that provides modern interfaces for property browsing, booking management, and rental administration.

### Key Features

**For Tenants:**
- Browse and search rental properties with advanced filters
- Book properties with secure payment processing (M-Pesa, Card, Bank Transfer)
- Manage active leases and payment history
- Submit and track maintenance requests
- Save favorite properties

**For Landlords:**
- List and manage multiple properties and units
- Review and approve/reject booking requests
- Track revenue and occupancy rates
- Handle tenant maintenance requests
- Manage documents and verifications

**For Admins:**
- System-wide monitoring and analytics
- User verification and dispute resolution
- Platform moderation and compliance

### Current Status

The frontend is fully designed with:
- ✅ Multi-step form wizards
- ✅ Advanced property filters
- ✅ Dashboard interfaces for all roles
- ✅ Payment checkout UI
- ✅ Responsive design

**Needs Backend Implementation:**
- ❌ Data persistence
- ❌ User authentication
- ❌ Payment processing integration
- ❌ File upload/storage
- ❌ Email notifications

---

## Core Data Models

All API responses should conform to these TypeScript interfaces used in the frontend.

### User (Base Interface)

```typescript
interface User {
  id: string;
  email: string;
  phone: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: "tenant" | "landlord" | "admin";
}
```

### Tenant Profile

```typescript
interface TenantProfile extends User {
  firstName: string;
  lastName: string;
  idNumber: string;
  currentLease?: Lease;
  paymentHistory: Payment[];
  maintenanceRequests: MaintenanceRequest[];
  favoriteProperties: string[]; // property IDs
}
```

### Landlord Profile

```typescript
interface LandlordProfile extends User {
  companyName: string;
  idNumber: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  branchCode?: string;
  properties: Property[];
  totalUnits: number;
  monthlyRevenue: number;
  activeLeases: number;
  documents: Document[];
}
```

### Admin Profile

```typescript
interface AdminProfile extends User {
  firstName: string;
  lastName: string;
  role: "super_admin" | "moderator";
  permissions: string[];
}
```

### Property

```typescript
interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  area: string;
  price: number; // monthly rent in KES
  description: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // sqft
  images: string[]; // image URLs
  amenities: string[]; // ["WiFi", "Parking", "Gym"]
  features: string[]; // ["Garden", "Balcony"]
  rating: number; // 0-5
  reviews: number;
  verified: boolean;
  available: boolean;
  landlordId: string;
  mapLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  walkToTransit: number; // minutes
  walkToMainRoad: number; // minutes
  hasBalcony: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Unit (Property Unit)

```typescript
interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  size: number; // sqft
  rent: number; // monthly in KES
  deposit: number; // in KES
  status: "vacant" | "occupied";
  images: string[];
  currentTenant?: string; // tenant ID
  leaseStartDate?: Date;
  leaseEndDate?: Date;
}
```

### Booking

```typescript
interface Booking {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  moveInDate: Date;
  numberOfTenants: number;
  bookingFee: number;
  deposit: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled";
  paymentStatus: "unpaid" | "partial" | "paid";
  submittedDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  reason?: string; // rejection reason
}
```

### Payment

```typescript
interface Payment {
  id: string;
  bookingId?: string;
  leaseId?: string;
  userId: string;
  amount: number;
  method: "mpesa" | "card" | "bank_transfer";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId: string;
  reference: string;
  paymentDate: Date;
  createdAt: Date;
  metadata?: object;
}
```

### Lease

```typescript
interface Lease {
  id: string;
  bookingId: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  status: "active" | "expired" | "terminated";
  documentUrl: string;
  createdAt: Date;
}
```

### Maintenance Request

```typescript
interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId: string;
  leaseId: string;
  tenantId: string;
  title: string;
  description: string;
  category: string; // "Plumbing", "Electrical", "Structural"
  priority: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "resolved" | "closed";
  submittedDate: Date;
  completedDate?: Date;
  comments: Comment[];
}
```

### Comment

```typescript
interface Comment {
  id: string;
  parentId: string; // maintenanceRequestId
  userId: string;
  text: string;
  attachments: string[]; // file URLs
  createdAt: Date;
}
```

### Document

```typescript
interface Document {
  id: string;
  userId: string;
  type: string; // "id_document", "proof_of_ownership", "kra_pin", "lease_agreement"
  url: string;
  status: "pending" | "verified" | "rejected";
  uploadedDate: Date;
  verifiedDate?: Date;
  rejectionReason?: string;
}
```

---

## API Endpoints Reference

### 1. Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "phone": "+254700000000",
  "role": "tenant" // or "landlord"
}

Response (201):
{
  "id": "user-uuid",
  "email": "user@example.com",
  "phone": "+254700000000",
  "role": "tenant",
  "verified": false,
  "token": "jwt-token-here"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "tenant",
    "verified": true
  }
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer {token}

Response (200):
{
  "message": "Logged out successfully"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "refresh-token-here"
}

Response (200):
{
  "token": "new-jwt-token"
}
```

#### Verify Email

```http
POST /api/auth/verify-email
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "code": "123456"
}

Response (200):
{
  "message": "Email verified successfully",
  "verified": true
}
```

#### Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Reset link sent to email"
}
```

---

### 2. Property Endpoints

#### List Properties

```http
GET /api/properties?location=Kilimani&minPrice=20000&maxPrice=100000&bedrooms=2&page=1&limit=12

Response (200):
{
  "properties": [
    {
      "id": "prop-1",
      "slug": "modern-2br-apartment-kilimani",
      "title": "Modern 2BR Apartment in Kilimani",
      "location": "Kilimani, Nairobi",
      "price": 65000,
      "bedrooms": 2,
      "bathrooms": 2,
      "size": 1200,
      "rating": 4.8,
      "reviews": 124,
      "images": ["url1", "url2"],
      "amenities": ["WiFi", "Parking", "Gym"],
      "verified": true
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 12
}
```

#### Get Property Detail

```http
GET /api/properties/{propertyId}

Response (200):
{
  "id": "prop-1",
  "slug": "modern-2br-apartment-kilimani",
  "title": "Modern 2BR Apartment in Kilimani",
  "location": "Kilimani, Nairobi",
  "price": 65000,
  "bedrooms": 2,
  "bathrooms": 2,
  "size": 1200,
  "description": "Spacious and modern apartment...",
  "images": ["url1", "url2", ...],
  "amenities": ["WiFi", "Parking", "Gym", "Security"],
  "rating": 4.8,
  "reviews": 124,
  "landlord": {
    "id": "landlord-1",
    "name": "John Kamau",
    "phone": "+254700000000",
    "verified": true,
    "avatar": "url"
  },
  "mapLocation": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Kilimani, Nairobi"
  },
  "units": [
    {
      "id": "unit-1",
      "unitNumber": "A101",
      "bedrooms": 2,
      "bathrooms": 2,
      "rent": 65000,
      "deposit": 130000,
      "status": "vacant"
    }
  ]
}
```

#### Create Property

```http
POST /api/properties
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "title": "Modern 2BR Apartment",
  "location": "Kilimani, Nairobi",
  "area": "Kilimani",
  "bedrooms": 2,
  "bathrooms": 2,
  "size": 1200,
  "description": "Spacious and modern apartment...",
  "amenities": ["WiFi", "Parking", "Gym"],
  "mapLocation": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Kilimani, Nairobi"
  }
}

Response (201):
{
  "id": "prop-new",
  "slug": "modern-2br-apartment-kilimani",
  "title": "Modern 2BR Apartment",
  ...
}
```

#### Update Property

```http
PUT /api/properties/{propertyId}
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "title": "Modern 2BR Apartment - Updated",
  "price": 70000
}

Response (200):
{
  "id": "prop-1",
  "title": "Modern 2BR Apartment - Updated",
  ...
}
```

#### Delete Property

```http
DELETE /api/properties/{propertyId}
Authorization: Bearer {landlord-token}

Response (200):
{
  "message": "Property deleted successfully"
}
```

#### Get Property Units

```http
GET /api/properties/{propertyId}/units

Response (200):
{
  "units": [
    {
      "id": "unit-1",
      "unitNumber": "A101",
      "bedrooms": 2,
      "bathrooms": 2,
      "size": 1000,
      "rent": 65000,
      "deposit": 130000,
      "status": "vacant",
      "images": ["url1", "url2"]
    }
  ]
}
```

#### Add Unit

```http
POST /api/properties/{propertyId}/units
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "unitNumber": "A102",
  "bedrooms": 2,
  "bathrooms": 2,
  "size": 1000,
  "rent": 65000,
  "deposit": 130000
}

Response (201):
{
  "id": "unit-new",
  "propertyId": "prop-1",
  "unitNumber": "A102",
  ...
}
```

#### Update Unit

```http
PUT /api/properties/{propertyId}/units/{unitId}
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "rent": 70000,
  "status": "occupied"
}

Response (200):
{
  "id": "unit-1",
  "rent": 70000,
  "status": "occupied",
  ...
}
```

---

### 3. Booking Endpoints

#### Create Booking

```http
POST /api/bookings
Authorization: Bearer {tenant-token}
Content-Type: application/json

Request Body:
{
  "propertyId": "prop-1",
  "unitId": "unit-1",
  "moveInDate": "2025-03-01",
  "numberOfTenants": 1
}

Response (201):
{
  "id": "booking-new",
  "propertyId": "prop-1",
  "unitId": "unit-1",
  "tenantId": "tenant-1",
  "moveInDate": "2025-03-01",
  "bookingFee": 350,
  "deposit": 130000,
  "status": "pending",
  "paymentStatus": "unpaid"
}
```

#### Get Bookings

```http
GET /api/bookings?status=pending&page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "bookings": [
    {
      "id": "booking-1",
      "propertyId": "prop-1",
      "propertyTitle": "Modern 2BR Apartment in Kilimani",
      "moveInDate": "2025-03-01",
      "status": "pending",
      "amount": 130350,
      "submittedDate": "2025-02-15"
    }
  ],
  "total": 5,
  "page": 1
}
```

#### Get Booking Detail

```http
GET /api/bookings/{bookingId}
Authorization: Bearer {token}

Response (200):
{
  "id": "booking-1",
  "propertyId": "prop-1",
  "propertyTitle": "Modern 2BR Apartment in Kilimani",
  "unitId": "unit-1",
  "tenantId": "tenant-1",
  "tenantName": "Jane Wanjiru",
  "tenantPhone": "+254712345678",
  "landlordId": "landlord-1",
  "moveInDate": "2025-03-01",
  "numberOfTenants": 1,
  "bookingFee": 350,
  "deposit": 130000,
  "totalAmount": 130350,
  "status": "pending",
  "paymentStatus": "unpaid",
  "submittedDate": "2025-02-15"
}
```

#### Update Booking (Approve/Reject)

```http
PUT /api/bookings/{bookingId}
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "status": "confirmed", // or "rejected"
  "reason": "Approved by landlord" // optional for rejection
}

Response (200):
{
  "id": "booking-1",
  "status": "confirmed",
  "approvedDate": "2025-02-16"
}
```

#### Get Booking Confirmation

```http
GET /api/bookings/{bookingId}/confirmation
Authorization: Bearer {tenant-token}

Response (200):
{
  "id": "booking-1",
  "reference": "TYR-2025-001234",
  "propertyTitle": "Modern 2BR Apartment in Kilimani",
  "location": "Kilimani, Nairobi",
  "unit": "A101",
  "moveInDate": "2025-03-01",
  "bookingFeeAmount": 350,
  "depositAmount": 130000,
  "totalPaid": 130350,
  "landlord": {
    "name": "John Kamau",
    "phone": "+254700000000",
    "email": "john@example.com"
  },
  "nextSteps": [
    "Landlord will contact you within 24-48 hours",
    "Finalize rental agreement",
    "Arrange move-in"
  ]
}
```

---

### 4. Payment Endpoints

#### Initiate Payment

```http
POST /api/payments
Authorization: Bearer {tenant-token}
Content-Type: application/json

Request Body:
{
  "bookingId": "booking-1",
  "amount": 130350,
  "method": "mpesa", // or "card", "bank_transfer"
  "phoneNumber": "+254712345678" // for M-Pesa
}

Response (200):
{
  "id": "payment-1",
  "status": "pending",
  "amount": 130350,
  "method": "mpesa",
  "message": "Please complete M-Pesa payment prompt"
}
```

#### Get Payment Detail

```http
GET /api/payments/{paymentId}
Authorization: Bearer {token}

Response (200):
{
  "id": "payment-1",
  "bookingId": "booking-1",
  "amount": 130350,
  "method": "mpesa",
  "status": "completed",
  "transactionId": "ABC123XYZ",
  "reference": "TYR-PAY-001",
  "paymentDate": "2025-02-15T14:30:00Z",
  "metadata": {
    "phone": "+254712345678"
  }
}
```

#### Get Payment History

```http
GET /api/payments/history?userId={userId}&limit=10&page=1
Authorization: Bearer {token}

Response (200):
{
  "payments": [
    {
      "id": "payment-1",
      "amount": 65000,
      "method": "mpesa",
      "status": "completed",
      "reference": "TYR-PAY-001",
      "paymentDate": "2025-02-01"
    }
  ],
  "total": 2,
  "page": 1
}
```

#### Request Refund

```http
POST /api/payments/{paymentId}/refund
Authorization: Bearer {tenant-token}
Content-Type: application/json

Request Body:
{
  "reason": "Booking rejected by landlord"
}

Response (200):
{
  "id": "refund-1",
  "paymentId": "payment-1",
  "status": "processing",
  "amount": 130350,
  "message": "Refund will be processed within 5-7 business days"
}
```

---

### 5. User/Profile Endpoints

#### Get User Profile

```http
GET /api/users/{userId}
Authorization: Bearer {token}

Response (200):
{
  "id": "user-1",
  "email": "user@example.com",
  "phone": "+254712345678",
  "role": "tenant",
  "verified": true,
  "profile": {
    "firstName": "Jane",
    "lastName": "Wanjiru",
    "idNumber": "12345678",
    "currentLease": {
      "id": "lease-1",
      "property": "Modern 2BR Apartment in Kilimani",
      "unit": "A101",
      "startDate": "2025-03-01",
      "endDate": "2026-02-28"
    }
  }
}
```

#### Update User Profile

```http
PUT /api/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "firstName": "Jane",
  "lastName": "Wanjiru",
  "phone": "+254712345678"
}

Response (200):
{
  "id": "user-1",
  "firstName": "Jane",
  "lastName": "Wanjiru",
  "phone": "+254712345678",
  ...
}
```

#### Get User Documents

```http
GET /api/users/{userId}/documents
Authorization: Bearer {token}

Response (200):
{
  "documents": [
    {
      "id": "doc-1",
      "type": "id_document",
      "url": "https://bucket.storage.com/doc1.pdf",
      "status": "verified",
      "uploadedDate": "2025-02-01",
      "verifiedDate": "2025-02-02"
    }
  ]
}
```

#### Upload Document

```http
POST /api/users/{userId}/documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
{
  "type": "id_document", // or "lease_agreement", "proof_of_income"
  "file": <binary-file-data>
}

Response (201):
{
  "id": "doc-new",
  "type": "id_document",
  "url": "https://bucket.storage.com/doc-new.pdf",
  "status": "pending",
  "uploadedDate": "2025-02-16"
}
```

#### Request Verification

```http
POST /api/users/{userId}/verify
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "documentIds": ["doc-1", "doc-2", "doc-3"]
}

Response (200):
{
  "message": "Verification request submitted",
  "status": "pending"
}
```

---

### 6. Dashboard Endpoints

#### Landlord Dashboard

```http
GET /api/landlord/dashboard
Authorization: Bearer {landlord-token}

Response (200):
{
  "stats": {
    "totalProperties": 5,
    "totalUnits": 24,
    "occupiedUnits": 18,
    "vacantUnits": 6,
    "monthlyRevenue": 1170000,
    "revenueChange": 12.5,
    "pendingBookings": 3,
    "activeLeases": 18
  },
  "properties": [
    {
      "id": "prop-1",
      "name": "Sunrise Apartments",
      "location": "Kilimani, Nairobi",
      "totalUnits": 12,
      "occupiedUnits": 10,
      "vacantUnits": 2,
      "monthlyRevenue": 650000
    }
  ],
  "recentBookings": [
    {
      "id": "booking-1",
      "tenant": "Jane Wanjiru",
      "property": "Sunrise Apartments",
      "moveInDate": "2025-03-01",
      "status": "pending"
    }
  ]
}
```

#### Tenant Dashboard

```http
GET /api/tenant/dashboard
Authorization: Bearer {tenant-token}

Response (200):
{
  "currentLease": {
    "property": "Modern 2BR Apartment in Kilimani",
    "unit": "A101",
    "location": "Kilimani, Nairobi",
    "rent": 65000,
    "deposit": 130000,
    "leaseStart": "2025-01-01",
    "leaseEnd": "2025-12-31",
    "nextPaymentDue": "2025-03-01",
    "daysUntilPayment": 5,
    "landlord": {
      "name": "John Kamau",
      "phone": "+254700000000",
      "email": "john@example.com",
      "verified": true
    }
  },
  "paymentHistory": [
    {
      "id": "pay-1",
      "date": "2025-02-01",
      "amount": 65000,
      "status": "paid",
      "method": "M-Pesa",
      "reference": "TYR-PAY-001"
    }
  ],
  "maintenanceRequests": [
    {
      "id": "maint-1",
      "title": "Leaking kitchen faucet",
      "status": "in-progress",
      "priority": "medium",
      "submittedDate": "2025-02-10"
    }
  ]
}
```

#### Admin Dashboard

```http
GET /api/admin/dashboard
Authorization: Bearer {admin-token}

Response (200):
{
  "stats": {
    "totalUsers": 156,
    "totalProperties": 42,
    "totalBookings": 89,
    "monthlyRevenue": 5200000,
    "verificationPending": 12,
    "disputesOpen": 3
  },
  "users": [
    {
      "id": "user-1",
      "name": "John Kamau",
      "email": "john@example.com",
      "type": "landlord",
      "status": "active",
      "verified": true,
      "joinedDate": "2025-01-10"
    }
  ],
  "pendingVerifications": [
    {
      "id": "verify-1",
      "landlord": "John Kamau",
      "property": "Sunrise Apartments",
      "submittedDate": "2025-02-10",
      "documents": ["ID", "Title Deed", "KRA PIN"],
      "status": "pending"
    }
  ]
}
```

---

### 7. Maintenance Endpoints

#### List Maintenance Requests

```http
GET /api/maintenance?status=pending&propertyId={propertyId}&page=1&limit=10
Authorization: Bearer {token}

Response (200):
{
  "requests": [
    {
      "id": "maint-1",
      "title": "Leaking kitchen faucet",
      "description": "Kitchen faucet has been leaking for 2 days",
      "category": "Plumbing",
      "priority": "medium",
      "status": "in-progress",
      "submittedDate": "2025-02-10",
      "tenant": "Jane Wanjiru"
    }
  ],
  "total": 5,
  "page": 1
}
```

#### Create Maintenance Request

```http
POST /api/maintenance
Authorization: Bearer {tenant-token}
Content-Type: application/json

Request Body:
{
  "leaseId": "lease-1",
  "title": "Leaking kitchen faucet",
  "description": "Kitchen faucet has been leaking for 2 days",
  "category": "Plumbing",
  "priority": "medium", // low, medium, high
  "attachments": ["url-to-image"]
}

Response (201):
{
  "id": "maint-new",
  "leaseId": "lease-1",
  "title": "Leaking kitchen faucet",
  "status": "pending",
  "submittedDate": "2025-02-15"
}
```

#### Update Maintenance Request

```http
PUT /api/maintenance/{requestId}
Authorization: Bearer {landlord-token}
Content-Type: application/json

Request Body:
{
  "status": "in-progress", // or "resolved", "closed"
  "completedDate": "2025-02-16"
}

Response (200):
{
  "id": "maint-1",
  "status": "in-progress",
  "updatedDate": "2025-02-16"
}
```

#### Get Comments

```http
GET /api/maintenance/{requestId}/comments
Authorization: Bearer {token}

Response (200):
{
  "comments": [
    {
      "id": "comment-1",
      "userId": "user-1",
      "userName": "John Kamau",
      "text": "Technician scheduled for tomorrow morning",
      "attachments": [],
      "createdAt": "2025-02-15T10:00:00Z"
    }
  ]
}
```

#### Add Comment

```http
POST /api/maintenance/{requestId}/comments
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "text": "Technician scheduled for tomorrow morning",
  "attachments": []
}

Response (201):
{
  "id": "comment-new",
  "userId": "user-1",
  "text": "Technician scheduled for tomorrow morning",
  "createdAt": "2025-02-15T10:00:00Z"
}
```

---

## Authentication & Authorization

### Token Strategy

- Use **JWT (JSON Web Tokens)** for stateless authentication
- Include token in `Authorization: Bearer {token}` header
- Token should include: `userId`, `role`, `email`
- Implement **refresh tokens** for extended sessions
- Token expiry: Access tokens (15 minutes), Refresh tokens (7 days)

### Role-Based Access Control (RBAC)

| Endpoint | Tenant | Landlord | Admin | Public |
|----------|--------|----------|-------|--------|
| `GET /properties` | ✅ | ✅ | ✅ | ✅ |
| `POST /properties` | ❌ | ✅ | ✅ | ❌ |
| `POST /bookings` | ✅ | ❌ | ✅ | ❌ |
| `PUT /bookings/{id}` | ❌ | ✅ | ✅ | ❌ |
| `GET /tenant/dashboard` | ✅ | ❌ | ✅ | ❌ |
| `GET /landlord/dashboard` | ❌ | ✅ | ✅ | ❌ |
| `GET /admin/dashboard` | ❌ | ❌ | ✅ | ❌ |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Optional: special character

### Security Best Practices

1. **Password Hashing**: Use bcrypt with salt rounds ≥ 10
2. **Rate Limiting**: Implement on auth endpoints (max 5 attempts per minute)
3. **HTTPS Only**: All API calls must use HTTPS in production
4. **CORS Configuration**: Whitelist frontend domain only
5. **Input Validation**: Sanitize all user inputs
6. **SQL Injection Prevention**: Use parameterized queries

---

## Database Schema Suggestions

### Recommended Database: PostgreSQL

**Rationale:**
- Strong ACID compliance
- Excellent JSON support for metadata fields
- PostGIS extension for location-based queries
- Robust indexing capabilities

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) CHECK (role IN ('tenant', 'landlord', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tenant profiles
CREATE TABLE tenant_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  id_number VARCHAR(50),
  favorite_properties JSONB DEFAULT '[]'
);

-- Landlord profiles
CREATE TABLE landlord_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  id_number VARCHAR(50),
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(100),
  branch_code VARCHAR(20)
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  area VARCHAR(100),
  price DECIMAL(10, 2),
  description TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  size INTEGER,
  images JSONB DEFAULT '[]',
  amenities JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  map_location JSONB,
  walk_to_transit INTEGER,
  walk_to_main_road INTEGER,
  has_balcony BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Units
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  unit_number VARCHAR(50),
  bedrooms INTEGER,
  bathrooms INTEGER,
  size INTEGER,
  rent DECIMAL(10, 2),
  deposit DECIMAL(10, 2),
  status VARCHAR(20) CHECK (status IN ('vacant', 'occupied')),
  images JSONB DEFAULT '[]',
  current_tenant_id UUID REFERENCES users(id),
  lease_start_date DATE,
  lease_end_date DATE
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  tenant_id UUID REFERENCES users(id),
  landlord_id UUID REFERENCES users(id),
  move_in_date DATE,
  number_of_tenants INTEGER,
  booking_fee DECIMAL(10, 2),
  deposit DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  payment_status VARCHAR(20) CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  submitted_date TIMESTAMP DEFAULT NOW(),
  approved_date TIMESTAMP,
  rejected_date TIMESTAMP,
  reason TEXT
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  lease_id UUID REFERENCES leases(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2),
  method VARCHAR(20) CHECK (method IN ('mpesa', 'card', 'bank_transfer')),
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(255),
  reference VARCHAR(100),
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Leases
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  tenant_id UUID REFERENCES users(id),
  landlord_id UUID REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  monthly_rent DECIMAL(10, 2),
  deposit DECIMAL(10, 2),
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'terminated')),
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  lease_id UUID REFERENCES leases(id),
  tenant_id UUID REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) CHECK (status IN ('pending', 'in-progress', 'resolved', 'closed')),
  submitted_date TIMESTAMP DEFAULT NOW(),
  completed_date TIMESTAMP
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  text TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100),
  url VARCHAR(500),
  status VARCHAR(20) CHECK (status IN ('pending', 'verified', 'rejected')),
  uploaded_date TIMESTAMP DEFAULT NOW(),
  verified_date TIMESTAMP,
  rejection_reason TEXT
);
```

### Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Property searches
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_properties_landlord_id ON properties(landlord_id);
CREATE INDEX idx_properties_verified ON properties(verified);

-- Booking queries
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_landlord_id ON bookings(landlord_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Payment tracking
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Set up project structure (Node.js/Express or Django/FastAPI)
- [ ] Configure PostgreSQL database
- [ ] Implement user authentication (JWT)
- [ ] Create user registration and login endpoints
- [ ] Set up email verification system
- [ ] Implement password reset functionality
- [ ] Configure CORS for frontend domain

### Phase 2: Core Features (Week 3-4)

- [ ] Property CRUD operations
- [ ] Unit management endpoints
- [ ] Property listing with filters
- [ ] Property search and pagination
- [ ] Image upload to cloud storage (AWS S3/Cloudinary)
- [ ] Implement role-based access control

### Phase 3: Booking System (Week 5-6)

- [ ] Booking creation and management
- [ ] Booking approval/rejection workflow
- [ ] Payment integration (M-Pesa API)
- [ ] Payment status tracking
- [ ] Refund processing
- [ ] Booking confirmation emails

### Phase 4: Dashboard & Analytics (Week 7)

- [ ] Landlord dashboard data aggregation
- [ ] Tenant dashboard endpoints
- [ ] Admin dashboard with system stats
- [ ] Revenue calculation and tracking
- [ ] Occupancy rate calculations

### Phase 5: Additional Features (Week 8)

- [ ] Maintenance request system
- [ ] Comment system for maintenance requests
- [ ] Document upload and verification
- [ ] User verification workflow
- [ ] Favorite properties functionality

### Phase 6: Testing & Deployment (Week 9-10)

- [ ] Unit tests for all endpoints
- [ ] Integration tests
- [ ] Load testing
- [ ] Security audit
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deploy to production (AWS/GCP/Azure)
- [ ] Set up monitoring and logging
- [ ] Configure CI/CD pipeline

---

## Integration Notes

### Frontend Integration Points

The frontend expects the following:

1. **Base URL Configuration**
   ```typescript
   // Frontend expects this in .env
   NEXT_PUBLIC_API_URL=https://api.tyrent.com
   ```

2. **Authentication Flow**
   - Login returns JWT token
   - Frontend stores token in localStorage
   - All subsequent requests include: `Authorization: Bearer {token}`
   - Token refresh handled automatically

3. **Image URLs**
   - All image fields expect full URLs (not relative paths)
   - Example: `https://cdn.tyrent.com/properties/abc123.jpg`

4. **Date Formats**
   - Send dates in ISO 8601 format: `2025-03-01T00:00:00Z`
   - Frontend will handle timezone conversions

5. **Error Response Format**
   ```json
   {
     "error": "Error message here",
     "code": "VALIDATION_ERROR",
     "details": {
       "field": "email",
       "message": "Email already exists"
     }
   }
   ```

6. **Pagination**
   - Use `page` and `limit` query parameters
   - Return `total`, `page`, `limit` in responses

### Payment Gateway Integration

**M-Pesa (Daraja API):**
- Consumer Key and Secret from Safaricom
- STK Push for payment prompts
- Callback URL for payment confirmations
- Test environment credentials provided by Safaricom

**Card Payments (Optional):**
- Stripe or Flutterwave integration
- PCI compliance requirements
- Webhook endpoints for payment status

---

## Error Handling Standards

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

### Error Response Structure

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "field": "fieldName", // optional
    "details": {} // optional additional context
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `DUPLICATE_RESOURCE` - Resource already exists
- `PAYMENT_FAILED` - Payment processing failed
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## Rate Limiting Recommendations

### Endpoint-Specific Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 5 requests | 1 minute |
| Property Listing | 100 requests | 1 minute |
| Property Creation | 10 requests | 1 hour |
| Booking Creation | 20 requests | 1 hour |
| Payment Initiation | 10 requests | 1 hour |
| File Upload | 20 requests | 1 hour |

### Implementation Strategy

1. Use Redis for distributed rate limiting
2. Return rate limit headers:
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 95
   X-RateLimit-Reset: 1635724800
   ```
3. Return 429 status when limit exceeded
4. Implement exponential backoff on frontend

---

## Deployment Considerations

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/tyrent
DATABASE_POOL_SIZE=20

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tyrent.com
SMTP_PASS=your-smtp-password

# M-Pesa
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=https://api.tyrent.com/payments/callback

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=tyrent-uploads
AWS_REGION=us-east-1

# Application
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://tyrent.com
API_BASE_URL=https://api.tyrent.com
```

### Infrastructure Recommendations

**Development:**
- Local PostgreSQL instance
- Local Redis instance
- ngrok for payment webhook testing

**Staging:**
- AWS RDS (PostgreSQL)
- AWS ElastiCache (Redis)
- AWS S3 (file storage)
- AWS EC2 or ECS for API
- CloudFront CDN

**Production:**
- Multi-AZ RDS deployment
- Redis cluster
- Auto-scaling EC2/ECS
- Load balancer (ALB)
- CloudWatch monitoring
- Backup automation

### Monitoring & Logging

**Required Logs:**
- API request/response logs
- Error logs with stack traces
- Authentication attempts
- Payment transactions
- Database query performance

**Monitoring Tools:**
- AWS CloudWatch or DataDog
- Sentry for error tracking
- Uptime monitoring (Pingdom/UptimeRobot)

---

## Support & Documentation

### API Documentation

Generate interactive API docs using:
- **Swagger/OpenAPI**: Auto-generate from code annotations
- **Postman Collection**: Export all endpoints for easy testing

### Contact

For questions or issues with this specification:
- Frontend Repository: [github.com/Mosesomo/tyrent-house-hunting](https://github.com/Mosesomo/tyrent-house-hunting)
- Create an issue in the backend repository

---

## License

This API specification is provided for the Tyrent House Hunting platform. All rights reserved.

---

**Last Updated:** December 15, 2025

