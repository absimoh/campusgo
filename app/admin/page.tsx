import { requireChatGPTUser } from "../chatgpt-auth";
import { requireAdmin } from "../../db/access";
import AdminClient from "./admin-client";

export const dynamic="force-dynamic";
export default async function Admin(){const identity=await requireChatGPTUser("/admin");const admin=await requireAdmin(identity.email);if(!admin)return <main className="access-page"><div><span>CampusGo Admin</span><h1>غير مصرح بالدخول</h1><p>هذا القسم مخصص لمسؤولي النظام.</p><a href="/dashboard">العودة</a></div></main>;return <AdminClient adminName={admin.full_name}/>}
