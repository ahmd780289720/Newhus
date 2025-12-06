import { CapacitorSQLite, SQLiteDBConnection } from "@capacitor-community/sqlite";

const DB_NAME = "security_system";
const DB_VERSION = 2; // عند إضافة جداول جديدة فقط زِد الرقم

export class SQLiteService {
  private static db: SQLiteDBConnection | null = null;

  // -------------------------------
  //  إنشاء الاتصال
  // -------------------------------
  private static async ensureConnection(): Promise<SQLiteDBConnection> {
    if (this.db) return this.db;

    const db = await CapacitorSQLite.createConnection(
      DB_NAME,
      false,
      "no-encryption",
      DB_VERSION,
      false
    );

    await db.open();
    await db.execute(`PRAGMA foreign_keys = ON;`);

    await this.setupSchema(db);

    this.db = db;
    return db;
  }

  // -------------------------------
  //  إنشاء الجداول
  // -------------------------------
  private static async setupSchema(db: SQLiteDBConnection): Promise<void> {
    // ======================
    // جدول المستخدمين
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // ======================
    // جدول النزلاء
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS inmates (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        nationalId TEXT,
        birthDate TEXT,
        address TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // ======================
    // جدول الفحص والتفتيش
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        officer TEXT,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id) ON DELETE CASCADE
      );
    `);

    // ======================
    // جدول المضبوطات
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS belongings (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        type TEXT,
        details TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id) ON DELETE CASCADE
      );
    `);

    // ======================
    // جدول العنابر
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wards (
        id TEXT PRIMARY KEY,
        name TEXT,
        capacity INTEGER,
        supervisor TEXT,
        created_at TEXT,
        updated_at TEXT
      );
    `);

    // ======================
    // جدول التسكين
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS housing_history (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        ward_id TEXT,
        assigned_at TEXT,
        released_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id),
        FOREIGN KEY (ward_id) REFERENCES wards(id)
      );
    `);

    // ======================
    // جدول الحركة
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS movements (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        type TEXT,
        destination TEXT,
        reason TEXT,
        date TEXT,
        created_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id)
      );
    `);

    // ======================
    // جدول الزيارات
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        visitorName TEXT,
        relation TEXT,
        purpose TEXT,
        visitDate TEXT,
        startTime TEXT,
        endTime TEXT,
        notes TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id)
      );
    `);

    // ======================
    // جدول المطلوبين
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS wanted (
        id TEXT PRIMARY KEY,
        name TEXT,
        caseNumber TEXT,
        status TEXT,
        notes TEXT,
        created_at TEXT
      );
    `);

    // ======================
    // جدول القضايا
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        caseType TEXT,
        judge TEXT,
        notes TEXT,
        created_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id)
      );
    `);

    // ======================
    // جدول المحاضر
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS minutes (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        content TEXT,
        created_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id)
      );
    `);

    // ======================
    // جدول الملفات (PDF)
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        inmate_id TEXT,
        file_path TEXT,
        mime_type TEXT,
        created_at TEXT,
        FOREIGN KEY (inmate_id) REFERENCES inmates(id)
      );
    `);

    // ======================
    // جدول السجلات
    // ======================
    await db.execute(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT,
        timestamp TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  }

  // -------------------------------
  // استرجاع DB instance
  // -------------------------------
  static async getInstance(): Promise<SQLiteDBConnection> {
    return await this.ensureConnection();
  }
}
