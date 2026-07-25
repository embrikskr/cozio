import { redirect } from "next/navigation";
import { currentUserId } from "./auth";

/** Returns the signed-in user's id or redirects to login. */
export async function requireUserId(): Promise<string> {
  const id = await currentUserId();
  if (!id) redirect("/login");
  return id;
}
