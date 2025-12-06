import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export type Inmate = {
  id: string;
  fullName: string;
  nationalId: string;
  arrestDate: string;
  referringAuthority: string;
  caseType: string;
  status: string; // PROCESSING - INSPECTED - READY_FOR_HOUSING - HOUSED - RELEASED
  wardId?: string | null;
  notes?: string;
  createdAt: string;
};

export class InmatesRepository {
  private static KEY = "sec_sys_inmates";

  /** إحضار جميع النزلاء */
  static async getAll(): Promise<Inmate[]> {
    return await SQLiteService.getCollection<Inmate[]>(this.KEY, []);
  }

  /** حفظ جميع النزلاء */
  private static async save(list: Inmate[]): Promise<void> {
    await SQLiteService.upsertCollection(this.KEY, list);
  }

  /** إضافة نزيل جديد */
  static async add(data: Omit<Inmate, "id" | "createdAt">): Promise<Inmate> {
    const inmates = await this.getAll();

    const newInmate: Inmate = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    inmates.push(newInmate);
    await this.save(inmates);

    return newInmate;
  }

  /** تحديث بيانات نزيل */
  static async update(updated: Inmate): Promise<void> {
    const inmates = await this.getAll();
    const index = inmates.findIndex((i) => i.id === updated.id);

    if (index !== -1) {
      inmates[index] = updated;
      await this.save(inmates);
    }
  }

  /** حذف نزيل */
  static async delete(id: string): Promise<void> {
    const inmates = await this.getAll();
    const filtered = inmates.filter((i) => i.id !== id);
    await this.save(filtered);
  }

  /** البحث عن نزيل */
  static async getById(id: string): Promise<Inmate | null> {
    const inmates = await this.getAll();
    return inmates.find((i) => i.id === id) ?? null;
  }

  /** تحديث حالة النزيل */
  static async updateStatus(id: string, status: string): Promise<void> {
    const inmates = await this.getAll();
    const inmate = inmates.find((i) => i.id === id);

    if (inmate) {
      inmate.status = status;
      await this.save(inmates);
    }
  }

  /** ربط النزيل بالعنبر */
  static async assignWard(inmateId: string, wardId: string): Promise<void> {
    const inmates = await this.getAll();
    const inmate = inmates.find((i) => i.id === inmateId);

    if (inmate) {
      inmate.wardId = wardId;
      inmate.status = "HOUSED";
      await this.save(inmates);
    }
  }
}
