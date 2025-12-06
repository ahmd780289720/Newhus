import { MovementsRepository, MovementRecord } from "../repositories/MovementsRepository";

export class MovementsService {

  // ➕ إضافة حركة جديدة
  static async addMovement(data: Omit<MovementRecord, "id">) {
    if (!data.inmate_id || !data.type || !data.date || !data.time) {
      throw new Error("يجب إدخال بيانات الحركة كاملة");
    }

    const movement = await MovementsRepository.add(data);
    return movement;
  }

  // ✏️ تعديل حركة
  static async updateMovement(id: string, updates: Partial<MovementRecord>) {
    return await MovementsRepository.updateMovement(id, updates);
  }

  // 🗑️ حذف حركة
  static async deleteMovement(id: string) {
    return await MovementsRepository.deleteMovement(id);
  }

  // 📌 جلب كل الحركات
  static async getAllMovements() {
    return await MovementsRepository.getAll();
  }

  // 📌 جلب الحركات حسب النزيل
  static async getMovementsByInmate(inmateId: string) {
    return await MovementsRepository.getByInmate(inmateId);
  }

  // 📌 جلب حركة واحدة حسب ID
  static async getMovementById(id: string) {
    const list = await MovementsRepository.getAll();
    return list.find(m => m.id === id) ?? null;
  }
}
