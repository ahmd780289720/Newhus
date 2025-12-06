import { SQLiteService } from "../database/SQLiteService";
import { v4 as uuidv4 } from "uuid";

export type BelongingItem = {
  id: string;
  type: string;
  data: any;
  notes?: string;
};

export type Inspection = {
  id: string;
  inmateId: string;
  isPhysicallyInspected: "Yes" | "No";
  physicalNotes: string;
  belongings: BelongingItem[];
  createdAt: string;
};

export class InspectionsRepository {
  private static KEY = "sec_sys_inspections";

  /** إحضار جميع عمليات الفحص */
  static async getAll(): Promise<Inspection[]> {
    return await SQLiteService.getCollection<Inspection[]>(this.KEY, []);
  }

  /** حفظ جميع الفحوصات */
  private static async save(list: Inspection[]): Promise<void> {
    await SQLiteService.upsertCollection(this.KEY, list);
  }

  /** إضافة فحص جديد */
  static async add(data: Omit<Inspection, "id" | "createdAt">): Promise<Inspection> {
    const list = await this.getAll();

    const newInspection: Inspection = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    list.push(newInspection);
    await this.save(list);

    return newInspection;
  }

  /** تحديث سجل فحص */
  static async update(updated: Inspection): Promise<void> {
    const list = await this.getAll();
    const index = list.findIndex((i) => i.id === updated.id);

    if (index !== -1) {
      list[index] = updated;
      await this.save(list);
    }
  }

  /** حذف فحص بالكامل */
  static async delete(id: string): Promise<void> {
    const list = await this.getAll();
    const filtered = list.filter((i) => i.id !== id);
    await this.save(filtered);
  }

  /** الحصول على فحص واحد */
  static async getById(id: string): Promise<Inspection | null> {
    const list = await this.getAll();
    return list.find((i) => i.id === id) ?? null;
  }

  /** الحصول على فحص نزيل واحد */
  static async getByInmateId(inmateId: string): Promise<Inspection | null> {
    const list = await this.getAll();
    return list.find((i) => i.inmateId === inmateId) ?? null;
  }

  /** إضافة مضبوطة لفحص معين */
  static async addBelonging(inmateId: string, item: BelongingItem): Promise<void> {
    const list = await this.getAll();
    const inspection = list.find((i) => i.inmateId === inmateId);

    if (!inspection) return;

    inspection.belongings.push(item);
    await this.save(list);
  }

  /** حذف مضبوطة */
  static async deleteBelonging(inmateId: string, itemId: string): Promise<void> {
    const list = await this.getAll();
    const inspection = list.find((i) => i.inmateId === inmateId);

    if (!inspection) return;

    inspection.belongings = inspection.belongings.filter((b) => b.id !== itemId);
    await this.save(list);
  }
}
