import { WantedRepository, WantedRecord } from "../repositories/WantedRepository";

export class WantedService {

  // ➕ إضافة مطلوب جديد
  static async addWanted(data: Omit<WantedRecord, "id">) {
    if (!data.name || !data.national_id || !data.crime_type) {
      throw new Error("الرجاء إدخال بيانات المطلوب الأساسية");
    }

    const record = await WantedRepository.addWanted(data);
    return record;
  }

  // ✏️ تعديل بيانات مطلوب
  static async updateWanted(id: string, updates: Partial<WantedRecord>) {
    return await WantedRepository.updateWanted(id, updates);
  }

  // 🗑️ حذف مطلوب
  static async deleteWanted(id: string) {
    return await WantedRepository.deleteWanted(id);
  }

  // 🔍 البحث بالاسم
  static async searchByName(text: string) {
    return await WantedRepository.searchByName(text);
  }

  // 📌 جلب كل المطلوبين
  static async getAllWanted() {
    return await WantedRepository.getAll();
  }

  // 📌 جلب مطلوب واحد حسب ID
  static async getWantedById(id: string) {
    const list = await WantedRepository.getAll();
    return list.find(w => w.id === id) ?? null;
  }
}
