import { env } from "cloudflare:workers";

export type PortalUser = { id:number; university_id:string; full_name:string; email:string; role:"student"|"admin"; status:string };

export async function findPortalUser(email: string): Promise<PortalUser | null> {
  return await env.DB.prepare("SELECT id, university_id, full_name, email, role, status FROM users WHERE lower(email) = lower(?) LIMIT 1")
    .bind(email).first<PortalUser>();
}

export async function requireAdmin(email: string): Promise<PortalUser | null> {
  const adminEmail = (env as unknown as { ADMIN_EMAIL?: string }).ADMIN_EMAIL;
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
    return { id: 0, university_id: "ADMIN", full_name: "CampusGo Administrator", email, role: "admin", status: "active" };
  }
  const user = await findPortalUser(email);
  return user?.role === "admin" && user.status === "active" ? user : null;
}
