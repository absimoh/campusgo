import { requireChatGPTUser } from "../chatgpt-auth";
import { findPortalUser, requireAdmin } from "../../db/access";
import DashboardClient from "./student-dashboard";

export const dynamic="force-dynamic";
export default async function Dashboard(){
  const identity=await requireChatGPTUser("/dashboard");
  const admin=await requireAdmin(identity.email);
  if(admin) return <meta httpEquiv="refresh" content="0;url=/admin"/>;
  const profile=await findPortalUser(identity.email);
  if(!profile) return <AccessNotice title="الحساب غير مسجل" text="اطلب من مسؤول النظام إضافة بريدك إلى قائمة طلاب الجامعة." email={identity.email}/>;
  if(profile.status!=="active") return <AccessNotice title="الحساب موقوف" text="يرجى التواصل مع إدارة النقل الجامعي لإعادة تفعيل حسابك." email={identity.email}/>;
  return <DashboardClient name={profile.full_name} universityId={profile.university_id}/>;
}
function AccessNotice({title,text,email}:{title:string;text:string;email:string}){return <main className="access-page"><img src="/university-of-jordan.png" alt="الجامعة الأردنية"/><div><span>CampusGo</span><h1>{title}</h1><p>{text}</p><code>{email}</code><a href="/signout-with-chatgpt?return_to=/">تسجيل الخروج</a></div></main>}
