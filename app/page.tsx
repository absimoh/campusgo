import { getChatGPTUser } from "./chatgpt-auth";
import PortalLogin from "./portal-login";

export const dynamic = "force-dynamic";
export default async function Home(){
  const user=await getChatGPTUser();
  return <PortalLogin signedIn={!!user} email={user?.email}/>;
}
