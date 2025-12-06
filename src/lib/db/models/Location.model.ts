import { field, getModel, model, unique } from "../odm";
import { Errors } from "@/lib/api-utils";
import { parseDbError } from "@/utils/db-error-parser";

@model("Location", {
  timestamps: true,
})
export class Location {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true })
  @unique()
  name!: string;

  @field({ type: String, required: true })
  addressLine1!: string;

  @field({ type: String })
  addressLine2?: string;

  @field({ type: String, required: true })
  city!: string;

  @field({ type: String, required: true })
  state!: string;

  @field({ type: String, required: true })
  postalCode!: string;

  @field({ type: String, required: true })
  country!: string;

  @field({ type: String })
  contact?: string;

  @field({ type: Boolean, default: true })
  isActive!: boolean;
}

export const LocationModel = getModel(Location);

export class LocationQueries {
  /**
   * Find location by ID
   */
  static async findById(id: string) {
    return LocationModel.findById(id).exec();
  }

  /**
   * Find location by name
   */
  static async findByName(name: string) {
    return LocationModel.findOne({ name }).exec();
  }

  /**
   * Get all locations
   */
  static async findAll(activeOnly = false) {
    const query = activeOnly ? { isActive: true } : {};
    return LocationModel.find(query).sort({ name: 1 }).exec();
  }

  /**
   * Get active locations
   */
  static async findActive() {
    return this.findAll(true);
  }

  /**
   * Check if location exists by name
   */
  static async existsByName(name: string): Promise<boolean> {
    const location = await LocationModel.findOne({ name }).exec();
    return !!location;
  }

  /**
   * Search locations by partial name match
   */
  static async searchByName(searchTerm: string) {
    return LocationModel.find({
      name: { $regex: searchTerm, $options: "i" },
    })
      .sort({ name: 1 })
      .exec();
  }

  /**
   * Find locations by city
   */
  static async findByCity(city: string) {
    return LocationModel.find({ city }).sort({ name: 1 }).exec();
  }

  /**
   * Find locations by state
   */
  static async findByState(state: string) {
    return LocationModel.find({ state }).sort({ city: 1, name: 1 }).exec();
  }
}

export class LocationMutations {
  /**
   * Create a new location
   */
  static async createLocation(data: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contact?: string;
  }) {
    try {
      // Check if location with same name already exists
      const existing = await LocationQueries.findByName(data.name);
      if (existing) {
        throw new Errors.Conflict("Location with this name already exists");
      }

      const location = await LocationModel.create(data);
      return location;
    } catch (error) {
      parseDbError(error);
    }
  }

  /**
   * Update location details
   */
  static async updateLocation(
    id: string,
    data: {
      name?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      contact?: string;
    }
  ) {
    const location = await LocationQueries.findById(id);
    if (!location) {
      throw new Errors.NotFound("Location not found");
    }

    // If name is being updated, check it doesn't conflict
    if (data.name && data.name !== location.name) {
      const existing = await LocationQueries.findByName(data.name);
      if (existing) {
        throw new Errors.Conflict("Location with this name already exists");
      }
    }

    if (data.name !== undefined) location.name = data.name;
    if (data.addressLine1 !== undefined)
      location.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined)
      location.addressLine2 = data.addressLine2;
    if (data.city !== undefined) location.city = data.city;
    if (data.state !== undefined) location.state = data.state;
    if (data.postalCode !== undefined) location.postalCode = data.postalCode;
    if (data.country !== undefined) location.country = data.country;
    if (data.contact !== undefined) location.contact = data.contact;

    return location.save();
  }

  /**
   * Deactivate a location
   */
  static async deactivateLocation(id: string) {
    const location = await LocationQueries.findById(id);
    if (!location) {
      throw new Errors.NotFound("Location not found");
    }

    location.isActive = false;
    return location.save();
  }

  /**
   * Reactivate a location
   */
  static async reactivateLocation(id: string) {
    const location = await LocationQueries.findById(id);
    if (!location) {
      throw new Errors.NotFound("Location not found");
    }

    location.isActive = true;
    return location.save();
  }

  /**
   * Delete a location (hard delete)
   * Note: Should check for associated shifts first
   */
  static async deleteLocation(id: string) {
    const location = await LocationQueries.findById(id);
    if (!location) {
      throw new Errors.NotFound("Location not found");
    }

    await LocationModel.findByIdAndDelete(id).exec();
    return location;
  }
}
