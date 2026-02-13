/**
 * useSupabaseData — Fetches ALL entity data from Supabase in parallel.
 * Replaces buildSeedData() as the initial data source for the app.
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { EmailFormat } from '../types/enums';
import type { AppState } from '../types/state';
import type {
  Department,
  OrgFunction,
  Responsibility,
  Grade,
  Staff,
  CrossFunctionalTeam,
  TeamMember,
  Workflow,
  WorkflowStep,
  ComplianceTag,
  CompanyNumber,
  CompanyNumberAllocation,
  User,
  CompanyProfile,
  AppSettings,
} from '../types/entities';

interface UseSupabaseDataReturn {
  data: AppState | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Singleton defaults (used when table is empty on first setup)
const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: '',
  name: '',
  location: '',
  website: '',
  logoUrl: '',
};

const DEFAULT_APP_SETTINGS: AppSettings = {
  id: '',
  emailDomain: 'company.com',
  emailFormat: EmailFormat.FirstnameL,
  maxManagerGradeLevel: 1,
};

export function useSupabaseData(): UseSupabaseDataReturn {
  const [data, setData] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        departmentsRes,
        functionsRes,
        responsibilitiesRes,
        gradesRes,
        staffRes,
        teamsRes,
        teamMembersRes,
        workflowsRes,
        workflowStepsRes,
        complianceTagsRes,
        companyNumbersRes,
        allocationsRes,
        usersRes,
        companyProfileRes,
        appSettingsRes,
      ] = await Promise.all([
        dataService.getAll<Department>('department'),
        dataService.getAll<OrgFunction>('function'),
        dataService.getAll<Responsibility>('responsibility'),
        dataService.getAll<Grade>('grade'),
        dataService.getAll<Staff>('staff'),
        dataService.getAll<CrossFunctionalTeam>('cross_functional_team'),
        dataService.getAll<TeamMember>('team_member'),
        dataService.getAll<Workflow>('workflow'),
        dataService.getAll<WorkflowStep>('workflow_step'),
        dataService.getAll<ComplianceTag>('compliance_tag'),
        dataService.getAll<CompanyNumber>('company_number'),
        dataService.getAll<CompanyNumberAllocation>('company_number_allocation'),
        dataService.getAll<User>('app_user'),
        dataService.getSingleton<CompanyProfile>('company_profile'),
        dataService.getSingleton<AppSettings>('app_settings'),
      ]);

      // Check for fetch errors
      const listResults = [
        { name: 'departments', res: departmentsRes },
        { name: 'functions', res: functionsRes },
        { name: 'responsibilities', res: responsibilitiesRes },
        { name: 'grades', res: gradesRes },
        { name: 'staff', res: staffRes },
        { name: 'teams', res: teamsRes },
        { name: 'team members', res: teamMembersRes },
        { name: 'workflows', res: workflowsRes },
        { name: 'workflow steps', res: workflowStepsRes },
        { name: 'compliance tags', res: complianceTagsRes },
        { name: 'company numbers', res: companyNumbersRes },
        { name: 'allocations', res: allocationsRes },
        { name: 'users', res: usersRes },
      ];

      const errors = listResults
        .filter((r) => r.res.error)
        .map((r) => `${r.name}: ${r.res.error}`);

      if (companyProfileRes.error) errors.push(`company profile: ${companyProfileRes.error}`);
      if (appSettingsRes.error) errors.push(`app settings: ${appSettingsRes.error}`);

      if (errors.length > 0) {
        setError(`Failed to load: ${errors.join('; ')}`);
        setLoading(false);
        return;
      }

      setData({
        departments: departmentsRes.data ?? [],
        functions: functionsRes.data ?? [],
        responsibilities: responsibilitiesRes.data ?? [],
        grades: gradesRes.data ?? [],
        staff: staffRes.data ?? [],
        crossFunctionalTeams: teamsRes.data ?? [],
        teamMembers: teamMembersRes.data ?? [],
        workflows: workflowsRes.data ?? [],
        workflowSteps: workflowStepsRes.data ?? [],
        complianceTags: complianceTagsRes.data ?? [],
        companyNumbers: companyNumbersRes.data ?? [],
        companyNumberAllocations: allocationsRes.data ?? [],
        users: usersRes.data ?? [],
        companyProfile: companyProfileRes.data ?? DEFAULT_COMPANY_PROFILE,
        appSettings: appSettingsRes.data ?? DEFAULT_APP_SETTINGS,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll };
}
