import { query } from "../_generated/server";
import { getAuthenticatedUser } from "../utils";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});
