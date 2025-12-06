import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export interface MovementRecord {
  id: string;
  inmate_id: string;     // رقم النزيل الذي تخصه الحركة
  type: string;          // نوع الحركة (دخول، خروج، نقل، مستشفى…)
  details?: string;      // وصف إضافي
  date: string;          // اليوم
  time: string;          // الوقت
}

export class MovementsRepository {
  private static COLLECTION_KEY = "sec_sys_movements";

  /** إرجاع كل السجلات */
  static async getAll(): Promise<MovementRecord[]> {
    return await SQLiteService.getCollection(MovementsRepository.COLLECTION_KEY, []);
  }

  /** إرجاع السجلات الخاصة بنزيل واحد */
  static async getByInmate(inmate_id: string): Promise<MovementRecord[]> {
    const list = await MovementsRepository.getAll();
    return list.filter(m => m.inmate_id === inmate_id);
  }

  /** إضافة حركة جديدة */
  static async addMovement(data: Omit<MovementRecord, "id">): Promise<MovementRecord> {
    const list = await MovementsRepository.getAll();

    const movement: MovementRecord = {
      id: uuidv4(),
      ...data,
    };

    list.push(movement);
    await SQLiteService.upsertCollection(MovementsRepository.COLLECTION_KEY, list);

    return movement;
  }

  /** تعديل حركة */
  static async updateMovement(id: string, changes: Partial<MovementRecord>): Promise<void> {
    const list = await MovementsRepository.getAll();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) return;

    list[index] = { ...list[index], ...changes };
    await SQLiteService.upsertCollection(MovementsRepository.COLLECTION_KEY, list);
  }

  /** حذف حركة */
  static async deleteMovement(id: string): Promise<void> {
    const list = await MovementsRepository.getAll();
    const filtered = list.filter(m => m.id !== id);
    await SQLiteService.upsertCollection(MovementsRepository.COLLECTION_KEY, filtered);
  }
}
