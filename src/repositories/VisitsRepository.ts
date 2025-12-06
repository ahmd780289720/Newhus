import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface VisitRecord {
  id: string;
  inmate_id: string;       // النزيل الذي تمت زيارته
  visitor_name: string;    // اسم الزائر
  relation: string;        // صلة القرابة / العلاقة
  visit_purpose: string;   // سبب الزيارة
  visit_date: string;      // تاريخ الزيارة
  visit_time: string;      // وقت الزيارة
  notes?: string;          // ملاحظات إضافية
  createdAt: string;       // تاريخ الإدخال
}

export class VisitsRepository {
  private static COLLECTION_KEY = "sec_sys_visits";

  /** جلب جميع الزيارات */
  static async getAll(): Promise<VisitRecord[]> {
    return await SQLiteService.getCollection<VisitRecord>(this.COLLECTION_KEY, []);
  }

  /** حفظ القائمة داخل قاعدة البيانات */
  private static async save(list: VisitRecord[]): Promise<void> {
    await SQLiteService.upsertCollection(this.COLLECTION_KEY, list);
  }

  /** إضافة زيارة جديدة */
  static async add(data: Omit<VisitRecord, "id" | "createdAt">): Promise<VisitRecord> {
    const list = await this.getAll();

    const entry: VisitRecord = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    list.push(entry);
    await this.save(list);

    return entry;
  }

  /** تحديث سجل زيارة */
  static async update(id: string, changes: Partial<VisitRecord>): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex(v => v.id === id);

    if (index === -1) return;

    list[index] = { ...list[index], ...changes };
    await this.save(list);
  }

  /** حذف زيارة */
  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const updated = list.filter(v => v.id !== id);
    await this.save(updated);
  }

  /** جلب زيارات حسب رقم النزيل */
  static async getByInmate(inmate_id: string): Promise<VisitRecord[]> {
    const list = await this.getAll();
    return list.filter(v => v.inmate_id === inmate_id);
  }
}
