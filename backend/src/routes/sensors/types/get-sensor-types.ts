import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "#lib/prisma.ts";

export const getSensorTypes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/sensors/types",
    {
      schema: {
        response: {
          200: z.object({
            sensorTypes: z.array(
              z.object({
                id: z.number().int().positive(),
                name: z.string(),
                unit: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async () => {
      const sensorTypes = await prisma.sensorType.findMany({
        select: {
          id: true,
          name: true,
          unit: true,
        },
      });

      return { sensorTypes };
    }
  );
};
