import { Types } from "mongoose";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
