/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as function_artworks from "../function/artworks.js";
import type * as function_museumCategories from "../function/museumCategories.js";
import type * as function_museums from "../function/museums.js";
import type * as function_users from "../function/users.js";
import type * as http from "../http.js";
import type * as schema_artworks from "../schema/artworks.js";
import type * as schema_museums from "../schema/museums.js";
import type * as schema_users from "../schema/users.js";
import type * as storage from "../storage.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "function/artworks": typeof function_artworks;
  "function/museumCategories": typeof function_museumCategories;
  "function/museums": typeof function_museums;
  "function/users": typeof function_users;
  http: typeof http;
  "schema/artworks": typeof schema_artworks;
  "schema/museums": typeof schema_museums;
  "schema/users": typeof schema_users;
  storage: typeof storage;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
