"use client";

import { useEffect, useMemo, useState } from "react";

type Lang = "ar" | "en";

const copy = {
  ar: {
    hello: "صباح الخير، سارة",
    sub: "رحلتك للجامعة جاهزة",
    live: "مباشر الآن",
    next: "محاضرتك القادمة",
    course: "هندسة البرمجيات",
    room: "مبنى الهندسة · قاعة 204",
    starts: "تبدأ خلال 48 دقيقة",
    routeTitle: "أفضل رحلة لك",
    leave: "اخرجي خلال",
    mins: "دقائق",
    walk: "4 دقائق مشي",
    stop: "محطة بوابة الشمال",
    bus: "باص U-12",
    arrival: "يصل 09:18",
    campus: "الحرم الرئيسي",
    track: "تتبّع الباص",
    seats: "18 مقعد متاح",
    onTime: "في الموعد",
    near: "أقرب محطة",
    distance: "320 متر عنك",
    directions: "الاتجاهات",
    schedule: "جدولي اليوم",
    seeAll: "عرض الكل",
    reminder: "تنبيه ذكي",
    reminderText: "سننبهك قبل موعد الخروج بـ 5 دقائق",
    home: "الرئيسية",
    routes: "الرحلات",
    map: "الخريطة",
    alerts: "التنبيهات",
    profile: "حسابي",
    search: "ابحثي عن مبنى، محطة أو خط...",
    mapLabel: "الخريطة الحية",
    arrived: "الباص يقترب من المحطة",
    brandBy: "تجربة رقمية من",
    notification: "تم تفعيل التنبيه لرحلتك القادمة",
  },
  en: {
    hello: "Good morning, Sarah",
    sub: "Your ride to campus is ready",
    live: "Live now",
    next: "Your next class",
    course: "Software Engineering",
    room: "Engineering Building · Room 204",
    starts: "Starts in 48 minutes",
    routeTitle: "Your best route",
    leave: "Leave in",
    mins: "minutes",
    walk: "4 min walk",
    stop: "North Gate Stop",
    bus: "Bus U-12",
    arrival: "Arrives 09:18",
    campus: "Main Campus",
    track: "Track bus",
    seats: "18 seats available",
    onTime: "On time",
    near: "Nearest stop",
    distance: "320 m away",
    directions: "Directions",
    schedule: "Today’s schedule",
    seeAll: "See all",
    reminder: "Smart reminder",
    reminderText: "We’ll alert you 5 minutes before it’s time to leave",
    home: "Home",
    routes: "Trips",
    map: "Map",
    alerts: "Alerts",
    profile: "Profile",
    search: "Search buildings, stops or routes...",
    mapLabel: "Live map",
    arrived: "Your bus is approaching the stop",
    brandBy: "A digital experience by",
    notification: "Alert enabled for your next trip",
  },
};

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    pin: <><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    bus: <><rect x="5" y="3" width="14" height="16" rx="3"/><path d="M5 12h14M8 7h8M8 19v2M16 19v2"/><circle cx="8" cy="15.5" r="1"/><circle cx="16" cy="15.5" r="1"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v11h14V10M9 21v-7h6v7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("ar");
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(false);
  const [busProgress, setBusProgress] = useState(38);
  const t = copy[lang];
  const rtl = lang === "ar";

  useEffect(() => {
    const timer = window.setInterval(() => setBusProgress((p) => (p >= 76 ? 30 : p + 1)), 1100);
    return () => window.clearInterval(timer);
  }, []);

  const nav = useMemo(() => [
    ["home", "home", t.home], ["routes", "bus", t.routes], ["map", "pin", t.map],
    ["alerts", "bell", t.alerts], ["profile", "user", t.profile],
  ], [t]);

  function notify() {
    setToast(true);
    window.setTimeout(() => setToast(false), 2600);
  }

  return (
    <main dir={rtl ? "rtl" : "ltr"} className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CampusGo home">
          <span className="brand-mark"><Icon name="pin"/><span>▰</span></span>
          <span>campus<b>Go</b></span>
        </a>
        <div className="top-actions">
          <button className="lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>{lang === "ar" ? "EN" : "عربي"}</button>
          <button className="icon-btn" onClick={notify} aria-label={t.alerts}><Icon name="bell"/><i /></button>
          <div className="avatar">س</div>
        </div>
      </header>

      <section className="page" id="top">
        <div className="greeting">
          <div><p>{t.sub}</p><h1>{t.hello} <span>👋</span></h1></div>
          <div className="status"><span></span>{t.live}</div>
        </div>

        <div className="search"><Icon name="search"/><input aria-label={t.search} placeholder={t.search}/><kbd>⌘ K</kbd></div>

        <div className="dashboard-grid">
          <div className="main-column">
            <section className="map-card" aria-label={t.mapLabel}>
              <div className="map-grid" />
              <div className="road road-a"/><div className="road road-b"/><div className="road road-c"/>
              <div className="route-line"><span className="moving-bus" style={{ insetInlineStart: `${busProgress}%` }}><Icon name="bus"/></span></div>
              <span className="map-pin campus-pin"><Icon name="pin"/></span>
              <span className="map-pin stop-pin"><span></span></span>
              <div className="map-caption"><span><i></i>{t.arrived}</span><b>3 {t.mins}</b></div>
              <button className="locate" aria-label={t.near}>⌖</button>
            </section>

            <section className="trip-card">
              <div className="trip-head"><div><span>{t.routeTitle}</span><h2>{t.leave} <strong>12</strong> {t.mins}</h2></div><div className="clock-badge"><Icon name="clock"/></div></div>
              <div className="timeline">
                <div className="timeline-row"><span className="dot start"/><div><b>{t.stop}</b><small>{t.walk}</small></div><time>09:15</time></div>
                <div className="timeline-track"><span></span><em><Icon name="bus"/> {t.bus}</em></div>
                <div className="timeline-row"><span className="dot end"/><div><b>{t.campus}</b><small>{t.room}</small></div><time>09:32</time></div>
              </div>
              <div className="trip-footer"><div><span className="good">● {t.onTime}</span><span>{t.seats}</span></div><button onClick={() => setTab("map")}>{t.track}<Icon name="arrow"/></button></div>
            </section>
          </div>

          <aside className="side-column">
            <section className="class-card">
              <div className="eyebrow"><Icon name="calendar"/>{t.next}</div>
              <h3>{t.course}</h3><p>{t.room}</p>
              <div className="class-time"><strong>10:00</strong><span>{t.starts}</span></div>
              <div className="progress"><i /></div>
            </section>

            <section className="near-card">
              <div className="near-icon"><Icon name="pin"/></div>
              <div><span>{t.near}</span><h3>{t.stop}</h3><p>{t.distance}</p></div>
              <button onClick={() => setTab("map")} aria-label={t.directions}><Icon name="arrow"/></button>
            </section>

            <section className="reminder-card">
              <div className="bell-art"><Icon name="bell"/></div>
              <div><h3>{t.reminder}</h3><p>{t.reminderText}</p></div>
              <label className="switch"><input type="checkbox" defaultChecked onChange={notify}/><span/></label>
            </section>
          </aside>
        </div>

        <section className="schedule-section">
          <div className="section-title"><h2>{t.schedule}</h2><button>{t.seeAll}</button></div>
          <div className="schedule-strip">
            <article className="schedule-item active"><time>10:00</time><i/><div><b>{t.course}</b><span>{t.room}</span></div></article>
            <article className="schedule-item"><time>12:00</time><i/><div><b>{rtl ? "قواعد البيانات" : "Database Systems"}</b><span>{rtl ? "مبنى العلوم · قاعة 112" : "Science Building · Room 112"}</span></div></article>
            <article className="schedule-item"><time>14:30</time><i/><div><b>{rtl ? "تفاعل الإنسان والحاسوب" : "Human–Computer Interaction"}</b><span>{rtl ? "مختبر الابتكار" : "Innovation Lab"}</span></div></article>
          </div>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Main navigation">{nav.map(([id, icon, label]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
      <footer><span>{t.brandBy}</span><b>LUMINODE</b><span className="spark">✦</span></footer>
      {toast && <div className="toast"><Icon name="bell"/>{t.notification}</div>}
    </main>
  );
}
