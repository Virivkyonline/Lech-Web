import { json, cookie } from "../../_utils/auth.js";

export async function onRequestPost() {
  return json({ success: true }, 200, { "Set-Cookie": cookie("lech_web_session", "", { maxAge: 0 }) });
}
