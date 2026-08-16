import { FormEvent, useEffect, useState } from "react";
import { supabase, type Profile } from "./supabase";

type Tab = "students" | "transport" | "stops";
type Route = {
  id: number;
  name: string;
  origin: string;
  destination: string;
  color: string;
  active: boolean;
};
type Stop = {
  id: number;
  route_id: number | null;
  name: string;
  landmark: string;
  stop_order: number;
  arrival_time: string | null;
  latitude: number | null;
  longitude: number | null;
};
type Bus = {
  id: number;
  code: string;
  driver_name: string;
  capacity: number;
  route_id: number | null;
  status: string;
  current_location: string;
  location_updated_at: string | null;
};
type Trip = {
  id: number;
  bus_code: string;
  route_name: string;
  stop_name: string;
  departure_time: string;
  arrival_time: string;
  active: boolean;
};
type Lecture = {
  id: number;
  student_id: number;
  course_name: string;
  building: string;
  room: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};
const days = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const tm = (v: string) => {
  if (!v) return "";
  const [hour, minute] = v.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "ص" : "م"}`;
};

export default function AdminDashboard({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<Tab>("students");
  const [users, setUsers] = useState<Profile[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [msg, setMsg] = useState("");
  async function load() {
    const [u, r, s, b, t] = await Promise.all([
      supabase
        .from("user_directory")
        .select("*")
        .order("id", { ascending: false }),
      supabase.from("transport_routes").select("*").order("name"),
      supabase.from("bus_stops").select("*").order("stop_order"),
      supabase.from("buses").select("*").order("code"),
      supabase.from("bus_trips").select("*").order("departure_time"),
    ]);
    setUsers((u.data || []) as Profile[]);
    setRoutes((r.data || []) as Route[]);
    setStops((s.data || []) as Stop[]);
    setBuses((b.data || []) as Bus[]);
    setTrips((t.data || []) as Trip[]);
  }
  useEffect(() => {
    load();
  }, []);
  const ok = (x: string) => {
    setMsg(x);
    setTimeout(() => setMsg(""), 2800);
  };
  async function openStudent(u: Profile) {
    setSelected(u);
    const { data } = await supabase
      .from("lectures")
      .select("*")
      .eq("student_id", u.id)
      .order("day_of_week")
      .order("start_time");
    setLectures((data || []) as Lecture[]);
  }
  async function saveStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const f = new FormData(e.currentTarget);
    const changes = {
      full_name: String(f.get("full_name")),
      university_id: String(f.get("university_id")),
      email: String(f.get("email")),
      role: String(f.get("role")) as "student" | "admin",
      status: String(f.get("status")) as "active" | "disabled",
    };
    const { error } = await supabase
      .from("user_directory")
      .update(changes)
      .eq("id", selected.id);
    if (error) return ok(error.message);
    setSelected({ ...selected, ...changes });
    ok("تم حفظ معلومات الطالب");
    load();
  }
  async function addLecture(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const f = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("lectures")
      .insert({
        student_id: selected.id,
        course_name: f.get("course"),
        building: f.get("building"),
        room: f.get("room"),
        day_of_week: Number(f.get("day")),
        start_time: f.get("start"),
        end_time: f.get("end"),
      });
    if (error) return ok(error.message);
    e.currentTarget.reset();
    ok("تمت إضافة المحاضرة");
    openStudent(selected);
  }
  async function role(u: Profile, value: "student" | "admin") {
    await supabase
      .from("user_directory")
      .update({ role: value })
      .eq("id", u.id);
    ok("تم تحديث الصلاحية");
    load();
  }
  async function status(u: Profile) {
    await supabase
      .from("user_directory")
      .update({ status: u.status === "active" ? "disabled" : "active" })
      .eq("id", u.id);
    load();
  }
  async function addRoute(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("transport_routes")
      .insert({
        name: f.get("name"),
        origin: f.get("origin"),
        destination: f.get("destination"),
        color: f.get("color"),
      });
    if (error) return ok(error.message);
    e.currentTarget.reset();
    ok("تمت إضافة المسار");
    load();
  }
  async function addStop(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("bus_stops")
      .insert({
        route_id: Number(f.get("route")),
        name: f.get("name"),
        landmark: f.get("landmark"),
        stop_order: Number(f.get("order")),
        arrival_time: f.get("arrival") || null,
        latitude: f.get("latitude") ? Number(f.get("latitude")) : null,
        longitude: f.get("longitude") ? Number(f.get("longitude")) : null,
      });
    if (error) return ok(error.message);
    e.currentTarget.reset();
    ok("تمت إضافة المحطة ووقتها");
    load();
  }
  async function updateStopTime(stop: Stop) {
    const value = prompt(
      `وقت وجود الباص في ${stop.name} (مثال 13:30 وسيظهر 1:30 م)`,
      stop.arrival_time?.slice(0, 5) || "",
    );
    if (value === null) return;
    const place = prompt(`موقع أو معلم محطة ${stop.name}`, stop.landmark || "");
    if (place === null) return;
    const { error } = await supabase
      .from("bus_stops")
      .update({ arrival_time: value || null, landmark: place })
      .eq("id", stop.id);
    if (error) return ok(error.message);
    ok("تم تحديث وقت وموقع المحطة");
    load();
  }
  async function addBus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const { error } = await supabase
      .from("buses")
      .insert({
        code: f.get("code"),
        driver_name: f.get("driver"),
        capacity: Number(f.get("capacity")),
        route_id: f.get("route") ? Number(f.get("route")) : null,
        status: "active",
        current_location: f.get("location") || "غير محدد",
        location_updated_at: new Date().toISOString(),
      });
    if (error) return ok(error.message);
    e.currentTarget.reset();
    ok("تمت إضافة الباص");
    load();
  }
  async function updateBusLocation(bus: Bus) {
    const value = prompt("اكتب موقع الباص الحالي", bus.current_location || "");
    if (!value?.trim()) return;
    const { error } = await supabase
      .from("buses")
      .update({
        current_location: value.trim(),
        location_updated_at: new Date().toISOString(),
      })
      .eq("id", bus.id);
    if (error) return ok(error.message);
    ok("تم تحديث موقع الباص");
    load();
  }
  async function addTrip(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const bus = buses.find((x) => x.id === Number(f.get("bus")));
    const service = String(f.get("service"));
    if (!bus) return ok("اختر باصًا");
    const departure = String(f.get("departure"));
    const { error } = await supabase
      .from("bus_trips")
      .insert({
        bus_code: bus.code,
        route_name: service,
        stop_name: service === "باص التدريب" ? "الصيدلة" : "كلية الرياضة",
        departure_time: departure,
        arrival_time: departure,
      });
    if (error) return ok(error.message);
    e.currentTarget.reset();
    ok("تمت إضافة موعد الانطلاق");
    load();
  }
  async function del(table: string, id: number) {
    if (!confirm("هل تريد الحذف؟")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return ok(error.message);
    ok("تم الحذف");
    load();
  }

  return (
    <main className="admin-app" dir="rtl">
      <aside>
        <div className="admin-brand">
          campus<b>Go</b>
        </div>
        <img src="/university-of-jordan.png" alt="الجامعة الأردنية" />
        <nav>
          <button
            className={tab === "students" ? "active" : ""}
            onClick={() => setTab("students")}
          >
            ◉ إدارة الطلاب
          </button>
          <button
            className={tab === "transport" ? "active" : ""}
            onClick={() => setTab("transport")}
          >
            ▣ الباصات والمسار
          </button>
          <button
            className={tab === "stops" ? "active" : ""}
            onClick={() => setTab("stops")}
          >
            ⌖ المحطات
          </button>
        </nav>
        <button
          className="aside-logout"
          onClick={() => supabase.auth.signOut()}
        >
          تسجيل الخروج
        </button>
      </aside>
      <section className="admin-main">
        <header>
          <div>
            <span>لوحة التحكم</span>
            <h1>
              {tab === "students"
                ? "إدارة الطلاب والمحاضرات"
                : tab === "transport"
                  ? "المسار الداخلي والباصات"
                  : "محطات المسار"}
            </h1>
          </div>
          <div className="admin-badge">{profile.full_name}</div>
        </header>
        {msg && <div className="admin-msg">{msg}</div>}
        {tab === "students" ? (
          <Students />
        ) : tab === "transport" ? (
          <Transport />
        ) : (
          <Stops />
        )}
      </section>
    </main>
  );

  function Students() {
    return (
      <>
        <div className="stats">
          <article>
            <span>الحسابات</span>
            <b>{users.length}</b>
          </article>
          <article>
            <span>الطلاب</span>
            <b>{users.filter((x) => x.role === "student").length}</b>
          </article>
          <article>
            <span>الأدمن</span>
            <b>{users.filter((x) => x.role === "admin").length}</b>
          </article>
        </div>
        <section className="manage">
          <h2>حسابات الطلاب</h2>
          <p>
            افتح الملف لتعديل معلومات الطالب ومحاضراته. المسار والباصات تظهر له
            تلقائيًا.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الحساب</th>
                  <th>الرقم</th>
                  <th>الصلاحية</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <b>{u.full_name}</b>
                      <small>{u.email}</small>
                    </td>
                    <td>{u.university_id}</td>
                    <td>
                      {u.user_id === profile.user_id ? (
                        <span className="role-owner">أدمن رئيسي</span>
                      ) : (
                        <select
                          className="role-select"
                          value={u.role}
                          onChange={(e) =>
                            role(u, e.target.value as "student" | "admin")
                          }
                        >
                          <option value="student">طالب</option>
                          <option value="admin">أدمن</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span className={u.status}>
                        {u.status === "active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="profile-open"
                        onClick={() => openStudent(u)}
                      >
                        فتح الملف
                      </button>
                      {u.user_id !== profile.user_id && (
                        <button
                          className="table-action"
                          onClick={() => status(u)}
                        >
                          {u.status === "active" ? "إيقاف" : "تفعيل"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {selected && (
          <section className="manage student-editor dashboard-editor">
            <div className="editor-title">
              <div>
                <span>ملف الطالب</span>
                <h2>{selected.full_name}</h2>
              </div>
              <button onClick={() => setSelected(null)}>×</button>
            </div>
            <h3>معلومات الحساب</h3>
            <form className="student-info-form" onSubmit={saveStudent}>
              <input
                name="full_name"
                required
                defaultValue={selected.full_name}
              />
              <input
                name="university_id"
                required
                defaultValue={selected.university_id}
              />
              <input
                name="email"
                type="email"
                required
                defaultValue={selected.email}
              />
              <select
                name="role"
                defaultValue={selected.role}
                disabled={selected.user_id === profile.user_id}
              >
                <option value="student">طالب</option>
                <option value="admin">أدمن</option>
              </select>
              <select
                name="status"
                defaultValue={selected.status}
                disabled={selected.user_id === profile.user_id}
              >
                <option value="active">نشط</option>
                <option value="disabled">موقوف</option>
              </select>
              <button>حفظ المعلومات</button>
            </form>
            <p className="editor-note">
              لا يحتاج الطالب إلى التسجيل في مسار؛ سيشاهد المسار الداخلي وكل
              الباصات.
            </p>
            <h3>إضافة محاضرة</h3>
            <form className="lecture-form" onSubmit={addLecture}>
              <input name="course" required placeholder="اسم المساق" />
              <input name="building" required placeholder="المبنى" />
              <input name="room" required placeholder="القاعة" />
              <select name="day">
                {days.map((d, i) => (
                  <option value={i} key={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input name="start" type="time" required />
              <input name="end" type="time" required />
              <button>+ إضافة محاضرة</button>
            </form>
            <div className="lecture-list">
              {lectures.map((l) => (
                <div key={l.id}>
                  <span>
                    <b>{l.course_name}</b>
                    <small>
                      {days[l.day_of_week]} · {tm(l.start_time)}–
                      {tm(l.end_time)} · {l.building} {l.room}
                    </small>
                  </span>
                  <button
                    onClick={async () => {
                      await supabase.from("lectures").delete().eq("id", l.id);
                      openStudent(selected);
                    }}
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }
  function Transport() {
    return (
      <>
        <div className="transport-grid">
          <section className="manage">
            <h2>المسار الداخلي</h2>
            <p>المواقف: العلمية، الطب، سكن الأندلس، الهندسة، والتربية.</p>
            <div className="entity-list">
              {routes.map((r) => (
                <div key={r.id}>
                  <i style={{ background: r.color }} />
                  <span>
                    <b>{r.name}</b>
                    <small>
                      {r.origin} ← {r.destination}
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="manage">
            <h2>إضافة باص</h2>
            <form className="data-form" onSubmit={addBus}>
              <input name="code" required placeholder="رمز الباص U-12" />
              <input name="driver" placeholder="اسم السائق" />
              <input name="capacity" type="number" min="1" defaultValue="40" />
              <select name="route">
                <option value="">بدون مسار</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <input name="location" placeholder="الموقع الحالي: كلية الطب" />
              <button>إضافة الباص</button>
            </form>
            <div className="entity-list">
              {buses.map((b) => (
                <div key={b.id}>
                  <span className="bus-symbol">🚌</span>
                  <span>
                    <b>{b.code}</b>
                    <small>
                      {routes.find((r) => r.id === b.route_id)?.name ||
                        "بدون مسار"}{" "}
                      · الموقع: {b.current_location || "غير محدد"}
                    </small>
                  </span>
                  <span className="entity-actions">
                    <button
                      className="location-edit"
                      onClick={() => updateBusLocation(b)}
                    >
                      تحديث الموقع
                    </button>
                    <button onClick={() => del("buses", b.id)}>حذف</button>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <section className="manage trip-manager">
          <h2>مواعيد الانطلاق</h2>
          <p>باص التدريب ينطلق من الصيدلة، وباص كلية الرياضة من موقف الكلية.</p>
          <form className="trip-form departure-admin-form" onSubmit={addTrip}>
            <select name="bus" required>
              <option value="">اختر الباص</option>
              {buses.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.code}
                </option>
              ))}
            </select>
            <select name="service" required>
              <option value="باص التدريب">باص التدريب — موقف الصيدلة</option>
              <option value="باص كلية الرياضة">باص كلية الرياضة</option>
            </select>
            <label>
              وقت الانطلاق
              <input name="departure" type="time" required />
            </label>
            <button>إضافة موعد الانطلاق</button>
          </form>
          <div className="trip-list">
            {trips
              .filter(
                (t) =>
                  t.route_name === "باص التدريب" ||
                  t.route_name === "باص كلية الرياضة",
              )
              .map((t) => (
                <div key={t.id}>
                  <b>{t.bus_code}</b>
                  <span>
                    {t.route_name} · {t.stop_name}
                  </span>
                  <time>{tm(t.departure_time)}</time>
                  <button onClick={() => del("bus_trips", t.id)}>حذف</button>
                </div>
              ))}
          </div>
        </section>
      </>
    );
  }
  function Stops() {
    return (
      <div className="transport-grid">
        <section className="manage">
          <h2>إضافة محطة ووقت الوصول</h2>
          <form className="data-form" onSubmit={addStop}>
            <select name="route" required>
              <option value="">اختر المسار</option>
              {routes.map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <input name="name" required placeholder="اسم المحطة" />
            <input name="landmark" placeholder="معلم قريب" />
            <input name="order" type="number" min="1" defaultValue="1" />
            <label>
              وقت وجود الباص
              <input name="arrival" type="time" />
            </label>
            <input
              name="latitude"
              type="number"
              step="any"
              placeholder="خط العرض (اختياري)"
            />
            <input
              name="longitude"
              type="number"
              step="any"
              placeholder="خط الطول (اختياري)"
            />
            <button>إضافة المحطة</button>
          </form>
        </section>
        <section className="manage">
          <h2>محطات المسار ومواعيدها</h2>
          <div className="entity-list stops-list">
            {stops.map((s) => (
              <div key={s.id}>
                <span className="stop-number">{s.stop_order}</span>
                <span>
                  <b>{s.name}</b>
                  <small>
                    {s.landmark} · وقت الباص{" "}
                    {tm(s.arrival_time || "") || "غير محدد"}
                  </small>
                </span>
                <span className="entity-actions">
                  <button
                    className="location-edit"
                    onClick={() => updateStopTime(s)}
                  >
                      تعديل الوقت والموقع
                  </button>
                  <button onClick={() => del("bus_stops", s.id)}>حذف</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
}
