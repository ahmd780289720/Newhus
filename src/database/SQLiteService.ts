import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

/**
 * أسماء الجداول التي ستخزن JSON (البيانات البسيطة)
 */
export type CollectionKey =
  | 'sec_sys_users_list'
  | 'sec_sys_user'
  | 'sec_sys_logs'
  | 'sec_sys_inmates'
  | 'sec_sys_inspections'
  | 'sec_sys_wards'
  | 'sec_sys_cases'
  | 'sec_sys_minutes'
  | 'sec_sys_wanted'
  | 'sec_sys_movements'
  | 'sec_sys_visits'
  | 'sec_sys_reports'
  | 'sec_sys_favorites';

/**
 * اسم قاعدة البيانات
 */
const DB_NAME = 'security_system';

/**
 * رقم نسخة قاعدة البيانات
 * إذا زاد الرقم → يتم تشغيل upgrade (دون حذف أي بيانات)
 * الآن = 2 (ومستقبلاً نزيد إلى 3، 4، ... بدون حذف البيانات)
 */
const DB_VERSION = 2;

export class SQLiteService {
  private static db: SQLiteDBConnection | null = null;

  /**
   * يتأكد من وجود اتصال مفتوح مع قاعدة البيانات
   */
  private static async ensureConnection(): Promise<SQLiteDBConnection> {
    if (this.db) return this.db;

    const db = await CapacitorSQLite.createConnection(
      DB_NAME,
      false,
      'no-encryption',
      DB_VERSION,
      false
    );

    await db.open();
    await db.execute(`PRAGMA foreign_keys = ON;`);

    // إنشاء الجداول (إذا لم تكن موجودة)
    await this.setupSchema(db);

    this.db = db;
    return db;
  }

  /**
   * إنشاء الجداول الأساسية عند أول تشغيل
   */
  private static async setupSchema(db: SQLiteDBConnection): Promise<void> {
    // جدول رئيسي لتخزين البيانات (بدل JSON)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // جدول تخزين الملفات (PDF / Images)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        operation_id TEXT,
        file_path TEXT NOT NULL,
        mime_type TEXT NOT NULL
      );
    `);
  }

  /**
   * الحصول على اتصال قاعدة البيانات (لاستخدامه في الـ Repositories)
   */
  static async getInstance(): Promise<SQLiteDBConnection> {
    return await this.ensureConnection();
  }

  /**
   * تخزين Collection داخل جدول collections
   * INSERT أو UPDATE حسب وجود المفتاح
   */
  static async upsertCollection(key: CollectionKey, data: any): Promise<void> {
    const db = await this.ensureConnection();
    const json = JSON.stringify(data ?? []);

    const sql = `
      INSERT INTO collections (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `;

    await db.run(sql, [key, json]);
  }

  /**
   * استرجاع Collection من جدول collections
   */
  static async getCollection<T = any>(key: CollectionKey, defaultValue: T): Promise<T> {
    const db = await this.ensureConnection();

    const res = await db.query(`SELECT value FROM collections WHERE key = ?`, [key]);

    if (!res.values || res.values.length === 0) {
      return defaultValue;
    }

    try {
      return JSON.parse(res.values[0].value as string) as T;
    } catch {
      return defaultValue;
    }
  }

  /**
   * حذف جميع البيانات (للتهيئة فقط)
   * لن نستخدمها بعد اليوم إلا لو أردت Reset يدوي
   */
  static async clearAll(): Promise<void> {
    const db = await this.ensureConnection();
    await db.execute(`DELETE FROM collections;`);
    await db.execute(`DELETE FROM files;`);
  }
}
