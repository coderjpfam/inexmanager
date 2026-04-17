import type { UserDocument } from "@/models/User";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export function toPublicUser(doc: UserDocument): PublicUser {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
