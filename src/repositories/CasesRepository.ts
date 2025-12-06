import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface CaseRecord {
  id: string;
  inmate_id: string;     // رقم النزيل المرتبط بالقضية
  case_type: string;     // نوع القضية
  case_status: string;   // حالة القضية
  notes?: string;        // ملاحظات إضافية
  date_added: string;    // تاريخ تسجيل القضية
}

export class CasesRepository {
  private static COLLECTION_KEY = "sec_sys_cases";

  /** إرجاع جميع القضايا */
  static async getAll(): Promise<CaseRecord[]> {
    return await SQLiteService.getCollection(CasesRepository.COLLECTION_KEY, []);
  }

  /** إرجاع القضايا الخاصة بنزيل محدد */
  static async getByInmate(inmate_id: string): Promise<CaseRecord[]> {
    const list = await CasesRepository.getAll();
    return list.filter(c => c.inmate_id === inmate_id);
  }

  /** إضافة قضية */
  static async addCase(data: Omit<CaseRecord, "id">): Promise<CaseRecord> {
    const list = await CasesRepository.getAll();

    const entry: CaseRecord = {
      id: uuidv4(),
      ...data,
    };

    list.push(entry);
    await SQLiteService.upsertCollection(CasesRepository.COLLECTION_KEY, list);
    return entry;
  }

  /** تعديل قضية */
  static async updateCase(id: string, changes: Partial<CaseRecord>): Promise<void> {
    const list = await CasesRepository.getAll();
    const index = list.findIndex(c => c.id === id);
    if (index === -1) return;

    list[index] = { ...list[index], ...changes };
    await SQLiteService.upsertCollection(CasesRepository.COLLECTION_KEY, list);
  }

  /** حذف قضية */
  static async deleteCase(id: string): Promise<void> {
    const list = await CasesRepository.getAll();
    const updated = list.filter(c => c.id !== id);
    await SQLiteService.upsertCollection(CasesRepository.COLLECTION_KEY, updated);
  }
}
