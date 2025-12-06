import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export type Ward = {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  supervisor?: string;
  createdAt: string;
};

export class WardsRepository {
  private static KEY = "sec_sys_wards";

  /** استرجاع جميع العنابر */
  static async getAll(): Promise<Ward[]> {
    return await SQLiteService.getCollection<Ward[]>(this.KEY, []);
  }

  /** حفظ كل العنابر */
  private static async save(list: Ward[]): Promise<void> {
    await SQLiteService.upsertCollection(this.KEY, list);
  }

  /** إضافة عنبر جديد */
  static async add(data: Omit<Ward, "id" | "createdAt" | "currentCount">): Promise<Ward> {
    const list = await this.getAll();

    const newWard: Ward = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      currentCount: 0,
      ...data,
    };

    list.push(newWard);
    await this.save(list);
    return newWard;
  }

  /** تحديث بيانات عنبر */
  static async update(updated: Ward): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex((w) => w.id === updated.id);

    if (index !== -1) {
      list[index] = updated;
      await this.save(list);
    }
  }

  /** حذف عنبر */
  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter((w) => w.id !== id);
    await this.save(filtered);
  }

  /** البحث عن عنبر واحد */
  static async getById(id: string): Promise<Ward | null> {
    const list = await this.getAll();
    return list.find((w) => w.id === id) ?? null;
  }

  /** زيادة عدد النزلاء داخل العنبر */
  static async incrementCount(id: string): Promise<void> {
    const ward = await this.getById(id);
    if (!ward) return;

    ward.currentCount++;
    await this.update(ward);
  }

  /** إنقاص عدد النزلاء داخل العنبر */
  static async decrementCount(id: string): Promise<void> {
    const ward = await this.getById(id);
    if (!ward) return;

    if (ward.currentCount > 0) {
      ward.currentCount--;
      await this.update(ward);
    }
  }
}
