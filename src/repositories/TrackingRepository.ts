import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface TrackingRecord {
  id: string;
  inmate_id: string;     // النزيل التابع له الحالة
  case_id?: string;      // القضية التابعة للحالة (اختياري)
  status: string;        // الحالة الحالية
  updated_by: string;    // المستخدم الذي قام بالتحديث
  notes?: string;
  updatedAt: string;     // وقت آخر تحديث
}

export class TrackingRepository {
  private static COLLECTION_KEY = "sec_sys_tracking";

  /** جلب كل السجلات */
  static async getAll(): Promise<TrackingRecord[]> {
    return await SQLiteService.getCollection<TrackingRecord>(this.COLLECTION_KEY, []);
  }

  /** حفظ القائمة */
  private static async save(list: TrackingRecord[]): Promise<void> {
    await SQLiteService.upsertCollection(this.COLLECTION_KEY, list);
  }

  /** إضافة حالة تتبع */
  static async add(data: Omit<TrackingRecord, "id" | "updatedAt">): Promise<TrackingRecord> {
    const list = await this.getAll();

    const entry: TrackingRecord = {
      id: uuidv4(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    list.push(entry);
    await this.save(list);

    return entry;
  }

  /** تحديث حالة */
  static async update(id: string, changes: Partial<TrackingRecord>): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex(t => t.id === id);

    if (index === -1) return;

    list[index] = {
      ...list[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    await this.save(list);
  }

  /** حذف حالة */
  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const updated = list.filter(t => t.id !== id);
    await this.save(updated);
  }

  /** جلب الحالات حسب النزيل */
  static async getByInmate(inmate_id: string): Promise<TrackingRecord[]> {
    const list = await this.getAll();
    return list.filter(t => t.inmate_id === inmate_id);
  }

  /** جلب الحالات حسب القضية */
  static async getByCase(case_id: string): Promise<TrackingRecord[]> {
    const list = await this.getAll();
    return list.filter(t => t.case_id === case_id);
  }
}
