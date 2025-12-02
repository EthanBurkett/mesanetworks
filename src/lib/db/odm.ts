import "reflect-metadata";
import mongoose, { Schema, SchemaOptions, Model, Document } from "mongoose";
import { env } from "@/config/env";

const META = {
  MODEL: Symbol("odm:model"),
  FIELDS: Symbol("odm:fields"),
  INDEXES: Symbol("odm:indexes"),
  HOOKS: Symbol("odm:hooks"),
};

type FieldOptions = {
  type?: any; // explicit Schema type
  required?: boolean;
  default?: any;
  enum?: readonly any[];
  ref?: string; // Mongoose ref
  unique?: boolean;
  index?: boolean | 1 | -1 | "text" | "hashed";
  sparse?: boolean;
  trim?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  array?: boolean; // force array of inferred type
  select?: boolean;
  min?: number;
  max?: number;
  match?: RegExp;
  validate?: mongoose.SchemaTypeOptions<any>["validate"];
};

type HookKind = "pre" | "post";
type HookOp =
  | "save"
  | "validate"
  | "remove"
  | "init"
  | "updateOne"
  | "deleteOne"
  | "find"
  | "findOne"
  | "findOneAndUpdate"
  | "insertMany";

type HookNextFunction = () => void;

type HookDef = { kind: HookKind; op: HookOp; handler: (...args: any[]) => any };

type ModelDef = { name: string; options?: SchemaOptions };

type IndexDef =
  | {
      keys: Record<string, 1 | -1 | "text" | "hashed">;
      options?: mongoose.IndexOptions;
    }
  | { prop: string; options?: mongoose.IndexOptions; unique?: boolean };

function ensure<T>(target: any, key: symbol, init: () => T): T {
  if (!Reflect.hasMetadata(key, target)) {
    Reflect.defineMetadata(key, init(), target);
  }
  return Reflect.getMetadata(key, target) as T;
}

// ---------- Decorators ----------

export function model(name: string, options?: SchemaOptions) {
  return function <T extends { new (...args: any[]): {} }>(ctor: T) {
    // Automatically add _id field to the class
    Object.defineProperty(ctor.prototype, "_id", {
      writable: true,
      enumerable: true,
      configurable: true,
    });

    Reflect.defineMetadata(META.MODEL, { name, options } as ModelDef, ctor);
    return ctor;
  };
}

export function field(opts: FieldOptions = {}) {
  return function (target: any, propertyKey: string) {
    const fields = ensure<Record<string, FieldOptions & { designType?: any }>>(
      target.constructor,
      META.FIELDS,
      () => ({})
    );
    const designType = Reflect.getMetadata("design:type", target, propertyKey);
    fields[propertyKey] = { ...fields[propertyKey], ...opts, designType };
  };
}

// Property index (single-field) helpers
export function index(options?: mongoose.IndexOptions) {
  return function (target: any, propertyKey: string) {
    const arr = ensure<IndexDef[]>(target.constructor, META.INDEXES, () => []);
    arr.push({ prop: propertyKey, options });
  };
}

export function unique(options?: mongoose.IndexOptions) {
  return function (target: any, propertyKey: string) {
    const arr = ensure<IndexDef[]>(target.constructor, META.INDEXES, () => []);
    arr.push({ prop: propertyKey, options, unique: true });
  };
}

// Class-level compound index
export function compoundIndex(
  keys: Record<string, 1 | -1 | "text" | "hashed">,
  options?: mongoose.IndexOptions
) {
  return function (ctor: any) {
    const arr = ensure<IndexDef[]>(ctor, META.INDEXES, () => []);
    arr.push({ keys, options });
  };
}

// Hooks
export function hook(
  kind: HookKind,
  op: HookOp,
  handler: (...args: any[]) => any
) {
  return function (ctor: any) {
    const hooks = ensure<HookDef[]>(ctor, META.HOOKS, () => []);
    hooks.push({ kind, op, handler });
  };
}

// Export the hook next function type for use in custom hooks
export type { HookNextFunction };

// ---------- Schema builder ----------

function mapJsTypeToMongoose(jsType: any): any {
  switch (jsType) {
    case String:
      return String;
    case Number:
      return Number;
    case Boolean:
      return Boolean;
    case Date:
      return Date;
    case Array:
      return Array;
    case Object:
      return Schema.Types.Mixed;
    default:
      // If it's a class with @model, treat as ObjectId ref unless overridden
      const modelDef = Reflect.getMetadata(META.MODEL, jsType);
      if (modelDef) return Schema.Types.ObjectId;
      return Schema.Types.Mixed;
  }
}

function toSchemaField(def: FieldOptions & { designType?: any }) {
  const baseType = def.type ?? mapJsTypeToMongoose(def.designType);
  const asArray = def.array || (def.designType === Array && !def.type);

  const core: any = {
    type: asArray ? [baseType] : baseType,
    required: def.required,
    default: def.default,
    enum: def.enum,
    ref: def.ref,
    unique: def.unique,
    index: def.index,
    sparse: def.sparse,
    trim: def.trim,
    lowercase: def.lowercase,
    uppercase: def.uppercase,
    select: def.select,
    min: def.min,
    max: def.max,
    match: def.match,
    validate: def.validate,
  };

  // Clean undefined values
  Object.keys(core).forEach((k) => core[k] === undefined && delete core[k]);
  return core;
}

function buildSchemaFromClass(ctor: any): Schema {
  const modelDef: ModelDef | undefined = Reflect.getMetadata(META.MODEL, ctor);
  if (!modelDef)
    throw new Error(`Class ${ctor.name} is not decorated with @model`);

  const fieldDefs = (Reflect.getMetadata(META.FIELDS, ctor) || {}) as Record<
    string,
    FieldOptions & { designType?: any }
  >;

  const schemaShape: Record<string, any> = {};
  for (const [key, f] of Object.entries(fieldDefs)) {
    schemaShape[key] = toSchemaField(f);
  }

  const schema = new Schema(schemaShape, {
    timestamps: true,
    ...modelDef.options,
  });

  // Indexes
  const idx = (Reflect.getMetadata(META.INDEXES, ctor) || []) as IndexDef[];
  for (const d of idx) {
    if ("keys" in d) {
      schema.index(d.keys, d.options);
    } else {
      // Single field index
      const indexOptions: mongoose.IndexOptions = {
        unique: d.unique,
        ...(d.options || {}),
      };
      schema.index({ [d.prop]: 1 }, indexOptions);
    }
  }

  // Hooks
  const hooks = (Reflect.getMetadata(META.HOOKS, ctor) || []) as HookDef[];
  for (const h of hooks) {
    if (h.kind === "pre") {
      schema.pre(h.op as any, h.handler as any);
    } else {
      schema.post(h.op as any, h.handler as any);
    }
  }

  return schema;
}

const modelCache = new Map<any, Model<any>>();

export function getModel<T = any>(
  ctor: new (...args: any[]) => T
): Model<
  Document &
    T & { createdAt: Date; updatedAt: Date; _id: mongoose.Types.ObjectId }
> {
  if (modelCache.has(ctor)) return modelCache.get(ctor)!;

  const def: ModelDef | undefined = Reflect.getMetadata(META.MODEL, ctor);
  if (!def) throw new Error(`Class ${ctor.name} is not decorated with @model`);

  const schema = buildSchemaFromClass(ctor);
  const mdl = mongoose.models[def.name] || mongoose.model(def.name, schema);

  modelCache.set(ctor, mdl);
  // @ts-ignore
  return mdl as Model<Document & T & { createdAt: Date; updatedAt: Date }>;
}

// Connection helper
let isConnected = false;

export async function connectDB(uri?: string): Promise<void> {
  if (isConnected) return;

  const mongoUri = uri || env.DATABASE_URI;
  if (!mongoUri) {
    throw new Error("❌ MONGODB_URI environment variable is required");
  }

  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}

export function disconnectDB(): Promise<void> {
  isConnected = false;
  return mongoose.disconnect();
}
