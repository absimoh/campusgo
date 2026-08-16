import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase, type Profile } from "./supabase";
type Lecture = {
  id: number;
  course_name: string;
  building: string;
  room: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};
type Stop = {
  id: number;
  name: string;
  landmark: string;
  stop_order: number;
  arrival_time: string | null;
  latitude: number | null;
  longitude: number | null;
};
type StopTime = {
  id: number;
  stop_id: number;
  arrival_time: string;
};
type Trip = {
  id: number;
  bus_code: string;
  route_name: string;
  departure_time: string;
};
type Point = { latitude: number; longitude: number };
const days = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const tm = (v: string | null) => {
  if (!v) return "--:--";
  const [hour, minute] = v.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "ص" : "م"}`;
};
const distance = (a: Point, b: Point) => {
  const r = 6371,
    dLat = ((b.latitude - a.latitude) * Math.PI) / 180,
    dLon = ((b.longitude - a.longitude) * Math.PI) / 180,
    x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.latitude * Math.PI) / 180) *
        Math.cos((b.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
const minutesUntil = (time: string | null) => {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number),
    now = new Date(),
    target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() < now.getTime()) target.setDate(target.getDate() + 1);
  return Math.max(0, Math.round((target.getTime() - now.getTime()) / 60000));
};
export default function StudentDashboard({ profile }: { profile: Profile }) {
  const [lectures, setLectures] = useState<Lecture[]>([]),
    [stops, setStops] = useState<Stop[]>([]),
    [stopTimes, setStopTimes] = useState<StopTime[]>([]),
    [trips, setTrips] = useState<Trip[]>([]),
    [position, setPosition] = useState<Point | null>(null),
    [locating, setLocating] = useState(false),
    [msg, setMsg] = useState("");
  async function load() {
    const [l, s, st, t] = await Promise.all([
      supabase
        .from("lectures")
        .select("*")
        .eq("student_id", profile.id)
        .order("day_of_week")
        .order("start_time"),
      supabase
        .from("bus_stops")
        .select("id,name,landmark,stop_order,arrival_time,latitude,longitude")
        .order("stop_order"),
      supabase
        .from("stop_times")
        .select("id,stop_id,arrival_time")
        .eq("active", true)
        .order("arrival_time"),
      supabase
        .from("bus_trips")
        .select("id,bus_code,route_name,departure_time")
        .in("route_name", ["باص التدريب", "باص كلية الرياضة"])
        .eq("active", true)
        .order("departure_time"),
    ]);
    setLectures((l.data || []) as Lecture[]);
    setStops((s.data || []) as Stop[]);
    setStopTimes((st.data || []) as StopTime[]);
    setTrips((t.data || []) as Trip[]);
  }
  useEffect(() => {
    load();
  }, [profile.id]);
  const nearest = useMemo(() => {
    if (!position) return null;
    return (
      stops
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => ({
          ...s,
          distance: distance(position, {
            latitude: s.latitude!,
            longitude: s.longitude!,
          }),
        }))
        .sort((a, b) => a.distance - b.distance)[0] || null
    );
  }, [position, stops]);
  const timesFor = (stopId: number) =>
    stopTimes.filter((x) => x.stop_id === stopId);
  const nearestNextTime = nearest
    ? timesFor(nearest.id).sort(
        (a, b) =>
          (minutesUntil(a.arrival_time) ?? Infinity) -
          (minutesUntil(b.arrival_time) ?? Infinity),
      )[0]?.arrival_time || null
    : null;
  const nextLecture = lectures[0],
    eta = minutesUntil(nearestNextTime);
  function locate() {
    if (!navigator.geolocation) return setMsg("تحديد الموقع غير مدعوم");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPosition({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setMsg("اسمح للموقع باستخدام موقعك لتحديد أقرب موقف");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }
  async function addLecture(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      { error } = await supabase
        .from("lectures")
        .insert({
          student_id: profile.id,
          course_name: f.get("course"),
          building: f.get("building"),
          room: f.get("room"),
          day_of_week: Number(f.get("day")),
          start_time: f.get("start"),
          end_time: f.get("end"),
        });
    setMsg(error?.message || "تمت إضافة المحاضرة");
    if (!error) {
      e.currentTarget.reset();
      load();
    }
  }
  async function removeLecture(id: number) {
    if (!confirm("حذف هذه المحاضرة؟")) return;
    const { error } = await supabase
      .from("lectures")
      .delete()
      .eq("id", id)
      .eq("student_id", profile.id);
    setMsg(error?.message || "تم حذف المحاضرة");
    if (!error) load();
  }
  return (
    <main className="student-app smart-student" dir="rtl">
      <header>
        <div className="mini-brand">
          campus<b>Go</b>
        </div>
        <img src="/university-of-jordan.png" alt="الجامعة الأردنية" />
        <div className="student-actions">
          <span>طالب</span>
          <button onClick={() => supabase.auth.signOut()}>تسجيل الخروج</button>
        </div>
      </header>
      <section className="smart-body">
        <div className="smart-welcome">
          <div>
            <span>مرحبًا، {profile.full_name} 👋</span>
            <p>
              {nextLecture
                ? `${nextLecture.building} — محاضرتك القادمة ${tm(nextLecture.start_time)}`
                : "أضف جدولك ليظهر موعد محاضرتك القادمة"}
            </p>
          </div>
          <button onClick={locate}>
            {locating ? "جاري تحديد موقعك..." : "⌖ تحديد أقرب موقف"}
          </button>
        </div>
        {msg && <div className="student-message">{msg}</div>}
        <section className="arrival-hero">
          <div className="live-chip">● تتبع المواعيد</div>
          <div className="arrival-main">
            <span>🚌</span>
            <div>
              <small>الباص إلى أقرب موقف</small>
              <h1>{eta == null ? "--" : eta}</h1>
              <b>دقيقة</b>
            </div>
          </div>
          <p>
            {nearest
              ? `إلى موقف ${nearest.name} · الموعد القادم ${tm(nearestNextTime)}`
              : "اضغط «تحديد أقرب موقف» لمعرفة المسافة ووقت وصول الباص"}
          </p>
          <div className="route-dots">
            {stops.map((s, i) => (
              <span
                className={nearest?.id === s.id ? "current" : ""}
                key={s.id}
              >
                <i />
                {s.name}
                <small>
                  {timesFor(s.id)
                    .slice(0, 3)
                    .map((x) => tm(x.arrival_time))
                    .join(" · ") || "لا توجد مواعيد"}
                </small>
                {i < stops.length - 1 && <em />}
              </span>
            ))}
          </div>
        </section>
        <section className="station-times student-card">
          <div className="student-section-title">
            <div>
              <span>الجدول اليومي</span>
              <h2>مواعيد الباص في المحطات</h2>
            </div>
          </div>
          <div className="station-times-grid">
            {stops.map((stop) => (
              <article key={stop.id}>
                <b>{stop.name}</b>
                <small>{stop.landmark}</small>
                <div>
                  {timesFor(stop.id).map((x) => (
                    <time key={x.id}>{tm(x.arrival_time)}</time>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <div className="smart-metrics">
          <article>
            <span>⌖</span>
            <div>
              <small>أقرب موقف</small>
              <b>{nearest?.name || "غير محدد"}</b>
            </div>
          </article>
          <article>
            <span>↔</span>
            <div>
              <small>المسافة التقريبية</small>
              <b>
                {nearest
                  ? nearest.distance < 1
                    ? `${Math.round(nearest.distance * 1000)} متر`
                    : `${nearest.distance.toFixed(1)} كم`
                  : "--"}
              </b>
            </div>
          </article>
          <article>
            <span>◷</span>
            <div>
              <small>المحاضرة القادمة</small>
              <b>{nextLecture ? tm(nextLecture.start_time) : "--:--"}</b>
            </div>
          </article>
        </div>
        <div className="smart-content">
          <section className="student-card schedule-manager">
            <div className="student-section-title">
              <div>
                <span>جدولك الشخصي</span>
                <h2>محاضراتي</h2>
              </div>
            </div>
            <form className="student-lecture-form" onSubmit={addLecture}>
              <input name="course" required placeholder="اسم المادة" />
              <input name="building" required placeholder="المبنى" />
              <input name="room" required placeholder="القاعة" />
              <select name="day">
                {days.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
              <label>
                تبدأ
                <input name="start" type="time" required />
              </label>
              <label>
                تنتهي
                <input name="end" type="time" required />
              </label>
              <button>+ إضافة للجدول</button>
            </form>
            <div className="student-data-list">
              {lectures.length ? (
                lectures.map((x) => (
                  <div key={x.id}>
                    <time>{tm(x.start_time)}</time>
                    <span>
                      <b>{x.course_name}</b>
                      <small>
                        {days[x.day_of_week]} · {x.building} · قاعة {x.room}
                      </small>
                    </span>
                    <button
                      className="lecture-delete"
                      onClick={() => removeLecture(x.id)}
                    >
                      حذف
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-state">أضف محاضراتك من النموذج أعلاه.</p>
              )}
            </div>
          </section>
          <section className="student-card departure-panel">
            <div className="student-section-title">
              <div>
                <span>مواعيد الانطلاق</span>
                <h2>الباصات الخاصة</h2>
              </div>
            </div>
            {["باص التدريب", "باص كلية الرياضة"].map((service) => (
              <article key={service}>
                <h3>{service}</h3>
                <small>
                  {service === "باص التدريب"
                    ? "موقف الصيدلة"
                    : "موقف كلية الرياضة"}
                </small>
                <div>
                  {trips
                    .filter((t) => t.route_name === service)
                    .map((t) => (
                      <b key={t.id}>{tm(t.departure_time)}</b>
                    ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
      <footer>
        POWERED BY{" "}
        <a href="https://luminodejo.com/" target="_blank" rel="noreferrer">
          <b>LUMINODE</b>
        </a>
      </footer>
    </main>
  );
}
