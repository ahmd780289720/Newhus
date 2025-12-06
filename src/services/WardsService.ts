import { WardsRepository, Ward } from "../repositories/WardsRepository";

export class WardsService {

  // ➕ إضافة عنبر جديد
  static async addWard(data: Omit<Ward, "id" | "createdAt" | "currentCount">) {
    if (!data.name || !data.capacity) {
      throw new Error("اسم العنبر والسعة مطلوبة");
    }

    const ward = await WardsRepository.add(data);
    return ward;
  }

  // ✏️ تعديل بيانات عنبر
  static async updateWard(id: string, updates: Partial<Ward>) {
    return await WardsRepository.update(id, updates);
  }

  // 🗑️ حذف عنبر
  static async deleteWard(id: string) {
    return await WardsRepository.delete(id);
  }

  // 📌 جلب عنبر واحد
  static async getWardById(id: string) {
    return await WardsRepository.getById(id);
  }

  // 📌 جلب كل العنابر
  static async getAllWards() {
    return await WardsRepository.getAll();
  }

  // 📈 زيادة عدد النزلاء داخل العنبر
  static async incrementCount(id: string) {
    await WardsRepository.incrementCount(id);
  }

  // 📉 تقليل عدد النزلاء داخل العنبر
  static async decrementCount(id: string) {
    await WardsRepository.decrementCount(id);
  }
}
