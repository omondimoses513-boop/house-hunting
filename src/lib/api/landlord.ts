import { apiRequest } from "@/lib/api/client"

export function backendUploadLandlordDocuments(formData: FormData) {
  return apiRequest<unknown>({
    path: "/api/landlord/documents/upload",
    method: "POST",
    formData,
  })
}

