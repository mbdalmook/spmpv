import type { Department, Grade, Staff } from "../types/entities";
import { DepartmentStatus } from "../types/enums";

/**
 * Compute the management status of a department.
 *
 * - No manager assigned → "Unmanaged"
 * - Manager's grade level ≤ maxManagerGradeLevel → "Managed"
 * - Manager's grade level > maxManagerGradeLevel → "Acting"
 */
export function getDepartmentStatus(
  dept: Department,
  allStaff: Staff[],
  allGrades: Grade[],
  maxManagerGradeLevel: number,
): DepartmentStatus {
  if (!dept.managerId) return DepartmentStatus.Unmanaged;

  const manager = allStaff.find((s) => s.id === dept.managerId);
  if (!manager) return DepartmentStatus.Unmanaged;

  const grade = allGrades.find((g) => g.id === manager.gradeId);
  if (!grade) return DepartmentStatus.Unmanaged;

  return grade.level <= maxManagerGradeLevel ? DepartmentStatus.Managed : DepartmentStatus.Acting;
}
