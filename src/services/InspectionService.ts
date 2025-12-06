import { InspectionsRepository, Inspection } from "../repositories/InspectionsRepository";
import { InmatesRepository } from "../repositories/InmatesRepository";

export class InspectionService {

  // ➕ إضافة عملية فحص جديدة
  static async addInspection(data: Omit<Inspection, "id" | "createdAt">) {
    if (!data.inmateId) {
      throw new Error("معرف النزيل مطلوب لإضافة الفحص");
    }

    const inmate = await InmatesRepository.getById(data.inmateId);
    if (!inmate) {
      throw new Error("النزيل غير موجود");
    }

    return await InspectionsRepository.add(data);
  }

  // ✏️ تعديل عملية فحص
  static async updateInspection(id: string, updates: Partial<Inspection>) {
    return await InspectionsRepository.update(id, updates);
  }

  // 🗑️ حذف عملية فحص
  static async deleteInspection(id: string) {
    return await InspectionsRepository.delete(id);
  }

  // 📌 جلب جميع عمليات الفحص
  static async getAllInspections() {
    return await InspectionsRepository.getAll();
  }

  // 📌 جلب فحص واحد
  static async getInspectionById(id: string) {
    return await InspectionsRepository.getById(id);
  }

  // 📌 جلب عمليات الفحص الخاصة بنزيل محدد
  static async getInspectionsByInmate(inmateId: string) {
    return await InspectionsRepository.getByInmate(inmateId);
  }
}
