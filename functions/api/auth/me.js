import { json, getCurrentUser, publicUser } from "../../_utils/auth.js";

export async function onRequestGet({ request, env }) {
  const user = await getCurrentUser(request, env);
  if (!user) return json({ success: false, error: "Neprihlásený účet." }, 401);
  return json({ success: true, user: publicUser(user) });
}
