import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  universityId: text("university_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  status: text("status", { enum: ["active", "disabled"] }).notNull().default("active"),
  createdAt: text("created_at").notNull(),
});

export const buses = sqliteTable("buses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  driverName: text("driver_name"),
  capacity: integer("capacity").notNull().default(40),
  status: text("status").notNull().default("active"),
});

export const routes = sqliteTable("routes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
});
