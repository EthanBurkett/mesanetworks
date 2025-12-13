"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/hooks";
import { toast } from "sonner";
import type { LocationResponse } from "@/lib/api/locations";

interface LocationFormData {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contact: string;
}

export function ManageLocationsDialog() {
  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<LocationResponse | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    contact: "",
  });

  const { data: locations = [], isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const resetForm = () => {
    setFormData({
      name: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "USA",
      contact: "",
    });
    setEditingLocation(null);
  };

  const handleEdit = (location: LocationResponse) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      addressLine1: location.addressLine1,
      addressLine2: location.addressLine2 || "",
      city: location.city,
      state: location.state,
      postalCode: location.postalCode,
      country: location.country,
      contact: location.contact || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.postalCode
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingLocation) {
        await updateLocation.mutateAsync({
          id: editingLocation._id,
          data: {
            name: formData.name,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2 || undefined,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            contact: formData.contact || undefined,
          },
        });
      } else {
        await createLocation.mutateAsync({
          name: formData.name,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || undefined,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          contact: formData.contact || undefined,
        });
      }
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this location? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteLocation.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (location: LocationResponse) => {
    try {
      await updateLocation.mutateAsync({
        id: location._id,
        data: {
          isActive: !location.isActive,
        },
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          Manage Locations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Manage Locations
          </DialogTitle>
          <DialogDescription>
            Add, edit, or remove work locations for scheduling
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Column */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              {editingLocation ? "Edit Location" : "Add New Location"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  placeholder="Main Office"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  placeholder="123 Main Street"
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine1: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  placeholder="Suite 100 (optional)"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addressLine2: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="CA"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    placeholder="94102"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="USA"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  placeholder="Site Manager Name (optional)"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    createLocation.isPending || updateLocation.isPending
                  }
                  className="flex-1"
                >
                  {createLocation.isPending || updateLocation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : editingLocation ? (
                    <Pencil className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingLocation ? "Update" : "Add"} Location
                </Button>
                {editingLocation && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Locations List Column */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              All Locations ({locations.length})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No locations yet</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locations.map((location) => (
                      <TableRow key={location._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{location.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {location.city}, {location.state}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(location)}
                          >
                            <Badge
                              variant={
                                location.isActive ? "default" : "secondary"
                              }
                            >
                              {location.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(location)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(location._id)}
                              disabled={deleteLocation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
