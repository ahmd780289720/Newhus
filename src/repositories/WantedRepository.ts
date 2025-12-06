import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface WantedRecord {
  id: string;
  name: string;            // اسم المطلوب
  national_id?: string;    // رقم البطاقة
  crime_type?: string;     // نوع القضية
  risk_level?: string;     // درجة الخطورة
  notes?: string;          // ملاحظات إضافية
  date_added: string;      // تاريخ الإدراج
}

export class WantedRepository {
  private static COLLECTION_KEY = "sec_sys_wanted";

  /** إرجاع جميع المطلوبين */
  static async getAll(): Promise<WantedRecord[]> {
    return await SQLiteService.getCollection(WantedRepository.COLLECTION_KEY, []);
  }

  /** البحث حسب الاسم */
  static async searchByName(text: string): Promise<WantedRecord[]> {
    const list = await WantedRepository.getAll();
    const t = text.toLowerCase();
    return list.filter(w => w.name.toLowerCase().includes(t));
  }

  /** إضافة مطلوب جديد */
  static async addWanted(data: Omit<WantedRecord, "id">): Promise<WantedRecord> {
    const list = await WantedRepository.getAll();

    const entry: WantedRecord = {
      id: uuidv4(),
      ...data,
    };

    list.push(entry);
    await SQLiteService.upsertCollection(WantedRepository.COLLECTION_KEY, list);
    return entry;
  }

  /** تعديل بيانات مطلوب */
  static async updateWanted(id: string, changes: Partial<WantedRecord>): Promise<void> {
    const list = await WantedRepository.getAll();
    const index = list.findIndex(w => w.id === id);
    if (index === -1) return;

    list[index] = { ...list[index], ...changes };
    await SQLiteService.upsertCollection(WantedRepository.COLLECTION_KEY, list);
  }

  /** حذف مطلوب */
  static async deleteWanted(id: string): Promise<void> {
    const list = await WantedRepository.getAll();
    const filtered = list.filter(w => w.id !== id);
    await SQLiteService.upsertCollection(WantedRepository.COLLECTION_KEY, filtered);
  }
}
