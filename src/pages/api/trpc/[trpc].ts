import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { z } from "zod";
import Rekognition from "aws-sdk/clients/rekognition";
import { TRPCError } from "@trpc/server";

const rekog = new Rekognition();

export const appRouter = trpc
  .router()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    async resolve({ input }) {
      const res = await rekog.listFaces({CollectionId: 'find-my-tween'}).promise();
      console.log(res.Faces);
      return {
        greeting: `hello ${input?.text ?? "world"}`,
      };
    },
  })
  .mutation("indexFace", {
    input: z.object({
      image: z.string(),
    }),
    async resolve({ input }) {
      try {
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to index face",
        });
      }
      const base64Img = input.image.replace("data:image/jpeg;base64,", "");
      const imgBuffer = Buffer.from(base64Img, "base64");
      await rekog
        .indexFaces({
          CollectionId: "find-my-tween",
          ExternalImageId: 'random-face',
          Image: {
            Bytes: imgBuffer,
          },
        })
        .promise();
      return true;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
