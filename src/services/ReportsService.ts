import { VisitsRepository } from "../repositories/VisitsRepository";
import { MovementsRepository } from "../repositories/MovementsRepository";
import { InmatesRepository } from "../repositories/InmatesRepository";
import { CasesRepository } from "../repositories/CasesRepository";
import { MinutesRepository } from "../repositories/MinutesRepository";

export class ReportsService {

  /**
   * تقرير زيارات — تحليلي
   * يجلب كل الزيارات لنزيل واحد أو لجميع النزلاء
   */
  static async getVisitsReport(inmateId?: string) {
    const visits = await VisitsRepository.getAll();
    const inmates = await InmatesRepository.getAll();

    let filtered = visits;

    if (inmateId) {
      filtered = visits.filter(v => v.inmate_id === inmateId);
    }

    return filtered.map(v => ({
      ...v,
      inmate: inmates.find(i => i.id === v.inmate_id) || null
    }));
  }

  /**
   * تقرير الحركة — تحليلي
   */
  static async getMovementReport(inmateId?: string) {
    const movements = await MovementsRepository.getAll();
    const inmates = await InmatesRepository.getAll();

    let filtered = movements;

    if (inmateId) {
      filtered = movements.filter(m => m.inmate_id === inmateId);
    }

    return filtered.map(m => ({
      ...m,
      inmate: inmates.find(i => i.id === m.inmate_id) || null
    }));
  }

  /**
   * تقرير القضايا — تحليلي
   */
  static async getCasesReport(inmateId?: string) {
    const cases = await CasesRepository.getAll();
    const inmates = await InmatesRepository.getAll();

    let filtered = cases;

    if (inmateId) {
      filtered = cases.filter(c => c.inmate_id === inmateId);
    }

    return filtered.map(c => ({
      ...c,
      inmate: inmates.find(i => i.id === c.inmate_id) || null
    }));
  }

  /**
   * تقرير المحاضر — تحليلي
   */
  static async getMinutesReport(inmateId?: string) {
    const minutes = await MinutesRepository.getAll();
    const inmates = await InmatesRepository.getAll();

    let filtered = minutes;

    if (inmateId) {
      filtered = minutes.filter(m => m.inmate_id === inmateId);
    }

    return filtered.map(m => ({
      ...m,
      inmate: inmates.find(i => i.id === m.inmate_id) || null
    }));
  }

  /**
   * تقرير شامل — دورة حياة النزيل كاملة
   */
  static async getFullInmateReport(inmateId: string) {
    const inmate = await InmatesRepository.getById(inmateId);
    if (!inmate) return null;

    const visits = await this.getVisitsReport(inmateId);
    const movements = await this.getMovementReport(inmateId);
    const cases = await this.getCasesReport(inmateId);
    const minutes = await this.getMinutesReport(inmateId);

    return {
      inmate,
      visits,
      movements,
      cases,
      minutes,
    };
  }
}
