import { CasesRepository, CaseRecord } from "../repositories/CasesRepository";

export class CasesService {

  // ➕ إضافة قضية جديدة
  static async addCase(data: Omit<CaseRecord, "id">) {

    if (!data.inmate_id || !data.case_number || !data.case_type) {
      throw new Error("الرجاء تعبئة بيانات القضية الأساسية");
    }

    const record = await CasesRepository.addCase(data);
    return record;
  }

  // ✏️ تعديل قضية
  static async updateCase(id: string, updates: Partial<CaseRecord>) {
    return await CasesRepository.updateCase(id, updates);
  }

  // 🗑️ حذف قضية
  static async deleteCase(id: string) {
    return await CasesRepository.deleteCase(id);
  }

  // 🔍 البحث برقم القضية
  static async searchByNumber(text: string) {
    return await CasesRepository.searchByNumber(text);
  }

  // 📌 جلب كل القضايا
  static async getAllCases() {
    return await CasesRepository.getAll();
  }

  // 📌 جلب قضية حسب ID
  static async getCaseById(id: string) {
    const list = await CasesRepository.getAll();
    return list.find(c => c.id === id) ?? null;
  }
}
