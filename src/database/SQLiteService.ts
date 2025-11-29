import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

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
  | 'sec_sys_reports'
  | 'sec_sys_favorites';

const DB_NAME = 'security_system';
const DB_VERSION = 1;

export class SQLiteService {
  private static db: SQLiteDBConnection | null = null;

  /**
   * تأكد من وجود اتصال مفتوح مع قاعدة البيانات
   */
  private static async ensureConnection(): Promise<SQLiteDBConnection> {
    if (this.db) {
      return this.db;
    }

    // إنشاء الاتصال
    const db = await CapacitorSQLite.createConnection(
      DB_NAME,
      false,
      'no-encryption',
      DB_VERSION,
      false,
    );

    await db.open();

    // إنشاء الجداول المطلوبة إذا لم تكن موجودة
    await this.setupSchema(db);

    this.db = db;
    return db;
  }

  /**
   * دالة داخلية لإنشاء الجداول
   */
  private static async setupSchema(db: SQLiteDBConnection): Promise<void> {
    // جدول لتخزين جميع الـ collections (المستخدمين، النزلاء، القضايا... إلخ)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS collections (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // جدول لملفات الـ PDF (يُستخدم من FileRepository)
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
   * ترجع اتصال الـ DB (للاستخدام في أماكن مثل FileRepository)
   */
  static async getInstance(): Promise<SQLiteDBConnection> {
    return await this.ensureConnection();
  }

  /**
   * تخزين Collection (مصفوفة) داخل جدول collections
   * إذا كان موجود نفس الـ key يتم تحديثه
   */
  static async upsertCollection(key: CollectionKey, data: any): Promise<void> {
    const db = await this.ensureConnection();
    const json = JSON.stringify(data ?? []);

    // INSERT مع ON CONFLICT لتعمل كـ insert أو update حسب وجود السجل
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

    const res = await db.query('SELECT value FROM collections WHERE key = ?', [key]);
    if (!res.values || res.values.length === 0) {
      return defaultValue;
    }

    try {
      const row = res.values[0] as { value: string };
      const parsed = JSON.parse(row.value);
      return parsed as T;
    } catch (e) {
      console.error('SQLite getCollection parse error', e);
      return defaultValue;
    }
  }

  /**
   * حذف كل البيانات (للاستخدام لو حبيت تربطه مع reset شامل)
   */
  static async clearAll(): Promise<void> {
    const db = await this.ensureConnection();
    await db.execute('DELETE FROM collections;');
    await db.execute('DELETE FROM files;');
  }
}
