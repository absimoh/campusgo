import { createClient } from "@supabase/supabase-js";
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key) throw new Error("Missing Supabase environment variables");
export const supabase=createClient(url,key);
export type Profile={id:number;user_id:string|null;university_id:string;full_name:string;email:string;role:"student"|"admin";status:"active"|"disabled"};
