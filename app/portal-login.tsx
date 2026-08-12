"use client";
import { useState } from "react";

export default function PortalLogin({ signedIn, email }: { signedIn:boolean; email?:string }) {
  const [lang,setLang]=useState<"ar"|"en">("ar");
  const ar=lang==="ar";
  return <main className="login-page" dir={ar?"rtl":"ltr"}>
    <section className="login-visual">
      <div className="login-overlay"/>
      <div className="login-brand"><span className="login-pin">●</span><strong>campus<b>Go</b></strong></div>
      <div className="login-copy"><span>{ar?"تنقّل جامعي أذكى":"SMARTER CAMPUS MOBILITY"}</span><h1>{ar?"جامعتك أقرب\nمما تتخيّل":"Your campus,\nright on time."}</h1><p>{ar?"تتبّع مباشر للباصات، محطات أقرب، وتنبيهات مرتبطة بجدولك الجامعي.":"Live bus tracking, nearby stops, and reminders connected to your class schedule."}</p></div>
      <div className="login-route"><i/><i/><i/><span>🚌</span></div>
      <div className="login-credit">POWERED BY <b>LUMINODE</b></div>
    </section>
    <section className="login-panel">
      <button className="login-lang" onClick={()=>setLang(ar?"en":"ar")}>{ar?"English":"العربية"}</button>
      <img className="university-logo" src="/university-of-jordan.png" alt={ar?"شعار الجامعة الأردنية":"The University of Jordan logo"}/>
      <div className="university-name"><b>{ar?"الجامعة الأردنية":"The University of Jordan"}</b><span>{ar?"بوابة النقل الجامعي":"Campus Transportation Portal"}</span></div>
      <div className="login-box"><h2>{ar?"أهلًا بك":"Welcome back"}</h2><p>{ar?"سجّل الدخول باستخدام البريد المسجل لدى الجامعة":"Sign in with the email registered by your university"}</p>
        {signedIn ? <><div className="signed-email">{email}</div><a className="primary-login" href="/dashboard">{ar?"متابعة إلى حسابي":"Continue to my account"}</a><a className="signout" href="/signout-with-chatgpt?return_to=/">{ar?"استخدام حساب آخر":"Use another account"}</a></> : <a className="primary-login" href="/signin-with-chatgpt?return_to=/dashboard"><span>✦</span>{ar?"تسجيل الدخول الآمن":"Secure sign in"}</a>}
        <small>{ar?"الحسابات تُنشأ من قِبل إدارة الجامعة فقط":"Accounts are created by university administrators only"}</small>
      </div>
      <div className="login-help">{ar?"تحتاج مساعدة؟ تواصل مع وحدة النقل الجامعي":"Need help? Contact the campus transportation office"}</div>
    </section>
  </main>
}
