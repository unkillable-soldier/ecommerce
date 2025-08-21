"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, MapPin, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
}

interface Address {
  id: string
  type: string
  fullName: string
  phoneNumber: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  })

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: "HOME",
    fullName: "",
    phoneNumber: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  })

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProfile()
    fetchAddresses()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses")
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
      }
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast.error("Failed to load addresses")
    }
  }

  const updateProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditingProfile(false)
        toast.success("Profile updated successfully!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
  }

  const saveAddress = async () => {
    // Client-side validation
    if (!addressForm.fullName.trim()) {
      toast.error("Full name is required")
      return
    }
    if (!addressForm.phoneNumber.trim() || addressForm.phoneNumber.length < 10) {
      toast.error("Phone number must be at least 10 digits")
      return
    }
    if (!addressForm.street.trim()) {
      toast.error("Street address is required")
      return
    }
    if (!addressForm.city.trim()) {
      toast.error("City is required")
      return
    }
    if (!addressForm.state.trim()) {
      toast.error("State is required")
      return
    }
    if (!addressForm.postalCode.trim() || addressForm.postalCode.length < 6) {
      toast.error("Postal code must be at least 6 digits")
      return
    }

    try {
      const url = editingAddressId 
        ? `/api/addresses/${editingAddressId}`
        : "/api/addresses"
      
      const method = editingAddressId ? "PUT" : "POST"

      // Debug: Log the request data
      console.log("Sending address data:", addressForm)

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      })

      if (response.ok) {
        fetchAddresses()
        resetAddressForm()
        toast.success(
          editingAddressId 
            ? "Address updated successfully!" 
            : "Address added successfully!"
        )
      } else {
        try {
          const data = await response.json()
          toast.error(data.error || "Failed to save address")
        } catch (jsonError) {
          console.error("Error parsing response:", jsonError)
          toast.error("Failed to save address. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address")
    }
  }

  const deleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchAddresses()
        toast.success("Address deleted successfully!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete address")
      }
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Failed to delete address")
    }
  }

  const editAddress = (address: Address) => {
    setEditingAddressId(address.id)
    setAddressForm({
      type: address.type,
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    })
    setIsAddingAddress(true)
  }

  const resetAddressForm = () => {
    setAddressForm({
      type: "HOME",
      fullName: "",
      phoneNumber: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    })
    setEditingAddressId(null)
    setIsAddingAddress(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">👤 My Profile</h1>
        <p className="text-gray-700 font-semibold">Manage your account information and addresses</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Profile Information
            </h2>
            <Button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              variant="outline"
              size="sm"
              className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {isEditingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="border-2 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="border-2 border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={updateProfile}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingProfile(false)
                    setProfileForm({
                      name: profile?.name || "",
                      email: profile?.email || "",
                    })
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="text-gray-800 font-semibold">{profile?.name || "Not set"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-800 font-semibold">{profile?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Member Since</span>
                <p className="text-gray-800 font-semibold">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-500" />
              Addresses
            </h2>
            <Button
              onClick={() => setIsAddingAddress(true)}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No addresses added yet</p>
              <Button
                onClick={() => setIsAddingAddress(true)}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white"
              >
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-gray-800">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-800">{address.fullName}</p>
                      <p className="text-gray-600 text-sm">{address.phoneNumber}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {address.street}, {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-gray-600 text-sm">{address.country}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => editAddress(address)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteAddress(address.id)}
                        variant="outline"
                        size="sm"
                        className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                         <h3 className="text-lg font-bold mb-4 text-gray-800">
               {editingAddressId ? "Edit Address" : "Add New Address"}
             </h3>
             <p className="text-sm text-gray-600 mb-4">
               Fields marked with <span className="text-red-500">*</span> are required
             </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500"
                >
                  <option value="HOME">🏠 Home</option>
                  <option value="WORK">🏢 Work</option>
                  <option value="OTHER">📍 Other</option>
                </select>
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Full Name <span className="text-red-500">*</span>
                 </label>
                 <Input
                   type="text"
                   value={addressForm.fullName}
                   onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                   placeholder="Enter full name"
                   required
                 />
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Phone Number <span className="text-red-500">*</span>
                 </label>
                 <Input
                   type="tel"
                   value={addressForm.phoneNumber}
                   onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                   placeholder="Enter phone number (min 10 digits)"
                   required
                 />
               </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Street Address <span className="text-red-500">*</span>
                 </label>
                 <Input
                   type="text"
                   value={addressForm.street}
                   onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                   placeholder="Enter street address"
                   required
                 />
               </div>

              <div className="grid grid-cols-2 gap-4">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     City <span className="text-red-500">*</span>
                   </label>
                   <Input
                     type="text"
                     value={addressForm.city}
                     onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                     placeholder="Enter city"
                     required
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     State <span className="text-red-500">*</span>
                   </label>
                   <Input
                     type="text"
                     value={addressForm.state}
                     onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                     placeholder="Enter state"
                     required
                   />
                 </div>
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Postal Code <span className="text-red-500">*</span>
                 </label>
                 <Input
                   type="text"
                   value={addressForm.postalCode}
                   onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                   placeholder="Enter postal code (min 6 digits)"
                   required
                 />
               </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                  Set as default address
                </label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={saveAddress}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAddressId ? "Update Address" : "Add Address"}
                </Button>
                <Button
                  onClick={resetAddressForm}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
