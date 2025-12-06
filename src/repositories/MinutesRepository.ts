import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface MinuteRecord {
  id: string;
  inmate_id: string;      // النزيل المرتبط بالمحضر
  investigator: string;   // اسم المحقق
  summary: string;        // ملخص التحقيق
  details?: string;       // تفاصيل إضافية
  date_added: string;     // تاريخ تسجيل المحضر
}

export class MinutesRepository {
  private static COLLECTION_KEY = "sec_sys_minutes";

  /** الحصول على كل المحاضر */
  static async getAll(): Promise<MinuteRecord[]> {
    return await SQLiteService.getCollection(MinutesRepository.COLLECTION_KEY, []);
  }

  /** الحصول على محاضر نزيل محدد */
  static async getByInmate(inmate_id: string): Promise<MinuteRecord[]> {
    const list = await MinutesRepository.getAll();
    return list.filter(m => m.inmate_id === inmate_id);
  }

  /** إضافة محضر جديد */
  static async addMinute(data: Omit<MinuteRecord, "id">): Promise<MinuteRecord> {
    const list = await MinutesRepository.getAll();

    const entry: MinuteRecord = {
      id: uuidv4(),
      ...data,
    };

    list.push(entry);
    await SQLiteService.upsertCollection(MinutesRepository.COLLECTION_KEY, list);

    return entry;
  }

  /** تعديل محضر */
  static async updateMinute(id: string, changes: Partial<MinuteRecord>): Promise<void> {
    const list = await MinutesRepository.getAll();
    const index = list.findIndex(m => m.id === id);

    if (index === -1) return;

    list[index] = { ...list[index], ...changes };
    await SQLiteService.upsertCollection(MinutesRepository.COLLECTION_KEY, list);
  }

  /** حذف محضر */
  static async deleteMinute(id: string): Promise<void> {
    const list = await MinutesRepository.getAll();
    const updated = list.filter(m => m.id !== id);
    await SQLiteService.upsertCollection(MinutesRepository.COLLECTION_KEY, updated);
  }
}
