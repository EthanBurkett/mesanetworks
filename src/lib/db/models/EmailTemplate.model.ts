import { field, getModel, model, unique } from "../odm";
import { parseDbError } from "@/utils/db-error-parser";
import { Errors } from "@/lib/api-utils";

export interface EmailTemplateVariables {
  [key: string]: string;
}

@model("EmailTemplate", {
  timestamps: true,
})
export class EmailTemplate {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true })
  @unique()
  slug!: string;

  @field({ type: String, required: true })
  name!: string;

  @field({ type: String, required: true })
  subject!: string;

  @field({ type: String, required: true })
  htmlContent!: string;

  @field({ type: String, required: true })
  textContent!: string;

  @field({ type: [String], default: [] })
  variables!: string[];

  @field({ type: String })
  description?: string;

  @field({ type: String })
  category?: string;

  @field({ type: Boolean, default: true })
  isActive!: boolean;

  @field({ type: String })
  createdBy?: string;

  @field({ type: String })
  updatedBy?: string;
}

export const EmailTemplateModel = getModel(EmailTemplate);

export class EmailTemplateQueries {
  static async findBySlug(slug: string) {
    return EmailTemplateModel.findOne({ slug, isActive: true }).exec();
  }

  static async findById(id: string) {
    return EmailTemplateModel.findById(id).exec();
  }

  static async findAll(filters?: { category?: string; isActive?: boolean }) {
    const query: any = {};

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return EmailTemplateModel.find(query).sort({ category: 1, name: 1 }).exec();
  }

  static async findByCategory(category: string) {
    return EmailTemplateModel.find({ category, isActive: true })
      .sort({ name: 1 })
      .exec();
  }
}

export class EmailTemplateMutations {
  static async create(data: {
    slug: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    variables?: string[];
    description?: string;
    category?: string;
    createdBy?: string;
  }) {
    try {
      const template = new EmailTemplateModel(data);
      return await template.save();
    } catch (error: any) {
      if (error.code === 11000 || error.message?.includes("E11000")) {
        throw new Errors.Conflict(
          "Email template with this slug already exists"
        );
      }
      throw new Errors.InternalServer("Failed to create email template");
    }
  }

  static async update(
    id: string,
    data: {
      name?: string;
      subject?: string;
      htmlContent?: string;
      textContent?: string;
      variables?: string[];
      description?: string;
      category?: string;
      isActive?: boolean;
      updatedBy?: string;
    }
  ) {
    try {
      const template = await EmailTemplateModel.findByIdAndUpdate(id, data, {
        new: true,
      }).exec();

      if (!template) {
        throw new Errors.NotFound("Email template not found");
      }

      return template;
    } catch (error) {
      if (error instanceof Errors.NotFound) {
        throw error;
      }
      throw new Errors.InternalServer("Failed to update email template");
    }
  }

  static async delete(id: string) {
    try {
      const template = await EmailTemplateModel.findByIdAndDelete(id).exec();

      if (!template) {
        throw new Errors.NotFound("Email template not found");
      }

      return template;
    } catch (error) {
      if (error instanceof Errors.NotFound) {
        throw error;
      }
      throw new Errors.InternalServer("Failed to delete email template");
    }
  }

  static async softDelete(id: string) {
    return this.update(id, { isActive: false });
  }
}
