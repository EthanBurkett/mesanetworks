import { wrapper } from "@/lib/api-utils";
import { NetworkDesignModel } from "@/lib/db/models/NetworkDesign.model";
import { env } from "@/config/env";
import { NextRequest } from "next/server";
import z from "zod";
import { nanoid } from "nanoid";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/v1/networks/[id]/share - Generate or update share link
export const POST = (request: NextRequest, context: RouteContext) =>
  wrapper(
    {
      request,
      requireAuth: true,
      parser: z.object({
        isPublic: z.boolean(),
        regenerateSlug: z.boolean().optional(),
      }),
    },
    async ({ body, auth }) => {
      const { id } = await context.params;
      const NetworkDesign = NetworkDesignModel();

      const network = await NetworkDesign.findOne({
        _id: id,
        ownerId: auth!.identifier,
      });

      if (!network) {
        throw new Error("Network not found or you don't have permission");
      }

      network.isPublic = body.isPublic;

      if (body.isPublic) {
        // Generate new slug if requested or if none exists
        if (body.regenerateSlug || !network.shareSlug) {
          network.shareSlug = nanoid(10);
        }
      } else {
        // Remove share slug when making private
        network.shareSlug = undefined;
      }

      await network.save();

      return {
        isPublic: network.isPublic,
        shareSlug: network.shareSlug,
        shareUrl: network.shareSlug
          ? `${env.APP_URL}/shared/${network.shareSlug}`
          : null,
      };
    }
  );
