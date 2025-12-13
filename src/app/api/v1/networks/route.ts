import { wrapper } from "@/lib/api-utils";
import {
  NetworkDesignModel,
  type NetworkNode,
  type NetworkEdge,
} from "@/lib/db/models/NetworkDesign.model";
import { NextRequest } from "next/server";
import z from "zod";
import { nanoid } from "nanoid";

// GET /api/v1/networks - List all networks for current user
export const GET = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
    },
    async ({ auth }) => {
      const NetworkDesign = NetworkDesignModel();

      // Get networks owned by user or shared with user
      const networks = await NetworkDesign.find({
        $or: [{ ownerId: auth!.identifier }, { sharedWith: auth!.identifier }],
      })
        .sort({ _updatedAt: -1 })
        .select("_id name description ownerId isPublic _createdAt _updatedAt")
        .lean();

      return networks;
    }
  );

const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.any(),
  selected: z.boolean().optional(),
  parentNode: z.string().optional(),
  extent: z.union([z.literal("parent"), z.array(z.number())]).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  style: z.any().optional(),
});

const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.string().optional(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
  data: z.any().optional(),
  markerEnd: z.any().optional(),
  selected: z.boolean().optional(),
  style: z.any().optional(),
});

// POST /api/v1/networks - Create new network design
export const POST = (request: NextRequest) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        nodes: z.array(NodeSchema),
        edges: z.array(EdgeSchema),
        metadata: z
          .object({
            nodeIdCounter: z.number().optional(),
            edgeIdCounter: z.number().optional(),
            layoutAlgorithm: z.string().optional(),
          })
          .optional(),
      }),
    },
    async ({ body, auth }) => {
      const NetworkDesign = NetworkDesignModel();

      const network = await NetworkDesign.create({
        name: body.name,
        description: body.description,
        ownerId: auth!.identifier,
        nodes: body.nodes,
        edges: body.edges,
        metadata: body.metadata,
        lastModifiedAt: new Date(),
      });

      return network;
    }
  );
