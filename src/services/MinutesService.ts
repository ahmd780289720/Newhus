import { MinutesRepository, MinuteRecord } from "../repositories/MinutesRepository";

export class MinutesService {

  // ➕ إضافة محضر جديد
  static async addMinute(data: Omit<MinuteRecord, "id">) {

    if (!data.inmate_id || !data.title || !data.content) {
      throw new Error("يجب إدخال بيانات المحضر الأساسية");
    }

    return await MinutesRepository.addMinute(data);
  }

  // ✏️ تعديل محضر
  static async updateMinute(id: string, updates: Partial<MinuteRecord>) {
    return await MinutesRepository.updateMinute(id, updates);
  }

  // 🗑️ حذف محضر
  static async deleteMinute(id: string) {
    return await MinutesRepository.deleteMinute(id);
  }

  // 📌 جلب كل المحاضر
  static async getAllMinutes() {
    return await MinutesRepository.getAll();
  }

  // 🔍 جلب محضر حسب ID
  static async getMinuteById(id: string) {
    const list = await MinutesRepository.getAll();
    return list.find(m => m.id === id) ?? null;
  }

  // 🔍 البحث بالنزيل
  static async getMinutesByInmate(inmate_id: string) {
    const list = await MinutesRepository.getAll();
    return list.filter(m => m.inmate_id === inmate_id);
  }
}
