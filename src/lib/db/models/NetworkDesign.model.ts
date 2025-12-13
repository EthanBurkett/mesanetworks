import { field, getModel, model } from "../odm";

export interface NetworkNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: string;
    status?: string;
    ip?: string;
    location?: string;
    vlan?: string;
    model?: string;
    ports?: number;
    metadata?: Record<string, string>;
    groupId?: string;
    onNameChange?: (name: string) => void;
  };
  selected?: boolean;
  parentNode?: string;
  extent?: "parent" | [number, number, number, number];
  width?: number;
  height?: number;
  style?: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  label?: string;
  data?: {
    bandwidth?: string;
    connectionType?: string;
    vlan?: string;
    latency?: string;
    qos?: string;
  };
  markerEnd?: any;
  selected?: boolean;
  style?: Record<string, any>;
}

@model("NetworkDesign", {
  timestamps: true,
})
export class NetworkDesign {
  _id!: string;
  _createdAt!: Date;
  _updatedAt!: Date;

  @field({ type: String, required: true })
  name!: string;

  @field({ type: String })
  description?: string;

  @field({ type: String, ref: "User", required: true })
  ownerId!: string;

  @field({ type: Array, default: [] })
  nodes!: NetworkNode[];

  @field({ type: Array, default: [] })
  edges!: NetworkEdge[];

  @field({ type: Object })
  metadata?: {
    nodeIdCounter?: number;
    edgeIdCounter?: number;
    layoutAlgorithm?: string;
  };

  @field({ type: Boolean, default: false })
  isPublic!: boolean;

  @field({ type: String })
  shareSlug?: string;

  @field({ type: [String], ref: "User", default: [] })
  sharedWith!: string[];

  @field({ type: Date })
  lastModifiedAt?: Date;
}

export const NetworkDesignModel = () => getModel(NetworkDesign);
