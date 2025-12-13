import { wrapper } from "@/lib/api-utils";
import { NetworkDesignModel } from "@/lib/db/models/NetworkDesign.model";
import { NextRequest } from "next/server";
import z from "zod";
import { nanoid } from "nanoid";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/v1/networks/[id] - Get specific network
export const GET = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true,
    },
    async ({ auth }) => {
      const { id } = await context.params;
      const NetworkDesign = NetworkDesignModel();

      const network = await NetworkDesign.findOne({
        _id: id,
        $or: [
          { ownerId: auth!.identifier },
          { sharedWith: auth!.identifier },
          { isPublic: true },
        ],
      }).lean();

      if (!network) {
        throw new Error("Network not found");
      }

      return network;
    }
  );

const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z.any(),
  selected: z.boolean().optional(),
  parentNode: z.string().optional(),
  extent: z
    .union([
      z.literal("parent"),
      z.tuple([z.number(), z.number(), z.number(), z.number()]),
    ])
    .optional(),
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

// PATCH /api/v1/networks/[id] - Update network
export const PATCH = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        nodes: z.array(NodeSchema).optional(),
        edges: z.array(EdgeSchema).optional(),
        metadata: z
          .object({
            nodeIdCounter: z.number().optional(),
            edgeIdCounter: z.number().optional(),
            layoutAlgorithm: z.string().optional(),
          })
          .optional(),
        isPublic: z.boolean().optional(),
      }),
    },
    async ({ body, auth }) => {
      const { id } = await context.params;
      const NetworkDesign = NetworkDesignModel();

      const network = await NetworkDesign.findOne({
        _id: id,
        ownerId: auth!.identifier, // Only owner can update
      });

      if (!network) {
        throw new Error("Network not found or you don't have permission");
      }

      if (body.name !== undefined) network.name = body.name;
      if (body.description !== undefined)
        network.description = body.description;
      if (body.nodes !== undefined) network.nodes = body.nodes;
      if (body.edges !== undefined) network.edges = body.edges;
      if (body.metadata !== undefined) network.metadata = body.metadata;
      if (body.isPublic !== undefined) network.isPublic = body.isPublic;
      network.lastModifiedAt = new Date();

      await network.save();

      return network;
    }
  );

// DELETE /api/v1/networks/[id] - Delete network
export const DELETE = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true,
    },
    async ({ auth }) => {
      const { id } = await context.params;
      const NetworkDesign = NetworkDesignModel();

      const result = await NetworkDesign.deleteOne({
        _id: id,
        ownerId: auth!.identifier, // Only owner can delete
      });

      if (result.deletedCount === 0) {
        throw new Error("Network not found or you don't have permission");
      }

      return { success: true };
    }
  );
