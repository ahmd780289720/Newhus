import { InmatesRepository } from "../repositories/InmatesRepository";
import { InspectionsRepository } from "../repositories/InspectionsRepository";
import { MovementsRepository } from "../repositories/MovementsRepository";
import { WantedRepository } from "../repositories/WantedRepository";
import { CasesRepository } from "../repositories/CasesRepository";
import { MinutesRepository } from "../repositories/MinutesRepository";
import { VisitsRepository } from "../repositories/VisitsRepository";

export interface Inmate {
  id?: string;
  name: string;
  age: number;
  nationality: string;
  id_number: string;
  case_type?: string;
  arrest_date: string;
  notes?: string;
}

export class InmateService {

  // إضافة نزيل جديد
  static async addInmate(data: Inmate) {
    if (!data.name || !data.id_number) {
      throw new Error("يجب إدخال اسم النزيل ورقم الهوية");
    }
    return await InmatesRepository.add(data as any);
  }

  // تعديل بيانات نزيل
  static async updateInmate(id: string, updates: Partial<Inmate>) {
    return await InmatesRepository.update(id, updates);
  }

  // حذف نزيل
  static async deleteInmate(id: string) {
    return await InmatesRepository.delete(id);
  }

  // جلب جميع النزلاء
  static async getAllInmates() {
    return await InmatesRepository.getAll();
  }

  // جلب نزيل واحد بالمعرف
  static async getInmateById(id: string) {
    return await InmatesRepository.getById(id);
  }

  // ================================
  //  📌 جلب ملف النزيل الكامل
  // ================================
  static async getFullInmateProfile(id: string) {
    const inmate = await InmatesRepository.getById(id);
    if (!inmate) return null;

    const inspections = await InspectionsRepository.getByInmate(id);
    const movements = await MovementsRepository.getByInmate(id);
    const visits = await VisitsRepository.getByInmate(id);
    const cases = await CasesRepository.getByInmate(id);
    const minutes = await MinutesRepository.getByInmate(id);

    return {
      ...inmate,
      inspections,
      movements,
      visits,
      cases,
      minutes,
    };
  }
}
