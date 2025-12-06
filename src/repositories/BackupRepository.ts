import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface BackupRecord {
  id: string;
  file_path: string;     // مسار النسخة الاحتياطية
  type: "FULL" | "PARTIAL";
  created_by: string;    // المستخدم الذي أنشأ النسخة
  createdAt: string;     // وقت إنشاء النسخة
  notes?: string;
}

export class BackupRepository {
  private static COLLECTION_KEY = "sec_sys_backups";

  /** جلب كل النسخ الاحتياطية */
  static async getAll(): Promise<BackupRecord[]> {
    return await SQLiteService.getCollection<BackupRecord>(this.COLLECTION_KEY, []);
  }

  /** حفظ القائمة */
  private static async save(list: BackupRecord[]): Promise<void> {
    await SQLiteService.upsertCollection(this.COLLECTION_KEY, list);
  }

  /** إضافة نسخة احتياطية جديدة */
  static async add(data: Omit<BackupRecord, "id" | "createdAt">): Promise<BackupRecord> {
    const list = await this.getAll();

    const entry: BackupRecord = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    list.push(entry);
    await this.save(list);

    return entry;
  }

  /** حذف نسخة احتياطية */
  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const updated = list.filter(b => b.id !== id);
    await this.save(updated);
  }

  /** جلب النسخ حسب نوع النسخة */
  static async getByType(type: "FULL" | "PARTIAL"): Promise<BackupRecord[]> {
    const list = await this.getAll();
    return list.filter(b => b.type === type);
  }

  /** جلب النسخ حسب المستخدم */
  static async getByUser(userId: string): Promise<BackupRecord[]> {
    const list = await this.getAll();
    return list.filter(b => b.created_by === userId);
  }
}
