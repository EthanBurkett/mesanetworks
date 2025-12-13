import { wrapper } from "@/lib/api-utils";
import { NetworkDesignModel } from "@/lib/db/models/NetworkDesign.model";
import { NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/v1/shared/[slug] - Get publicly shared network by slug
export const GET = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: false, // Public endpoint
    },
    async () => {
      const { slug } = await context.params;
      const NetworkDesign = NetworkDesignModel();

      const network = await NetworkDesign.findOne({
        shareSlug: slug,
        isPublic: true,
      }).lean();

      if (!network) {
        throw new Error("Shared network not found or is not public");
      }

      // Return network without sensitive information
      return {
        _id: network._id,
        name: network.name,
        description: network.description,
        nodes: network.nodes,
        edges: network.edges,
        _createdAt: network._createdAt,
        _updatedAt: network._updatedAt,
      };
    }
  );
