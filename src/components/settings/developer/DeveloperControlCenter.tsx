import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import DeveloperHeader, { DeveloperTabType } from './DeveloperHeader';
import DeveloperDashboardTab from './DeveloperDashboardTab';
import DeveloperTenantsPermissionsTab from './DeveloperTenantsPermissionsTab';
import DeveloperAccountsPreviewTab from './DeveloperAccountsPreviewTab';
import DeveloperSystemUpdatesTab from './DeveloperSystemUpdatesTab';
import DeveloperSystemCloudTab from './DeveloperSystemCloudTab';
import DeveloperMaintenanceHealthTab from './DeveloperMaintenanceHealthTab';
import DeveloperFinancialStatementModal from './DeveloperFinancialStatementModal';
import { ShieldAlert } from 'lucide-react';

export default function DeveloperControlCenter() {
  const { state, updateState, logAction, currentUser } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as DeveloperTabType;

  const validTabs: DeveloperTabType[] = [
    'dashboard', 'tenants_permissions', 'accounts_preview',
    'system_updates', 'system_cloud', 'maintenance_health'
  ];

  const initialTab = validTabs.includes(tabFromUrl) ? tabFromUrl : 'dashboard';
  const [activeTab, setActiveTabState] = useState<DeveloperTabType>(initialTab);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveTab = (tab: DeveloperTabType) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  // Security Access Guard
  if (!currentUser || (currentUser.role !== 'developer' && currentUser.role !== 'master_admin')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-red-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">وصول محظور - مخصص لكبير مهندسي النظام فقط</h2>
        <p className="text-slate-500 text-sm max-w-md">
          هذه الشاشة محمية ببروتوكول أمان مخصص للمطور الرئيسي (Role: 'developer' / 'master_admin') لإدارة التراخيص والحسابات المالية.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Sleek Developer Header with Badges & Navigation Tabs */}
      <DeveloperHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clinics={state.clinics || []}
        onOpenFinancialStatement={() => setIsFinancialModalOpen(true)}
      />

      {/* 2. Active Tab Content Area */}
      <div className="transition-all duration-300">
        {activeTab === 'dashboard' && (
          <DeveloperDashboardTab
            state={state}
            onNavigateToTenants={() => setActiveTab('tenants_permissions')}
          />
        )}

        {activeTab === 'tenants_permissions' && (
          <DeveloperTenantsPermissionsTab
            state={state}
            updateState={updateState}
            logAction={logAction}
          />
        )}

        {activeTab === 'accounts_preview' && (
          <DeveloperAccountsPreviewTab
            state={state}
            updateState={updateState}
            logAction={logAction}
          />
        )}

        {activeTab === 'system_updates' && (
          <DeveloperSystemUpdatesTab
            state={state}
            updateState={updateState}
            logAction={logAction}
          />
        )}

        {activeTab === 'system_cloud' && (
          <DeveloperSystemCloudTab
            state={state}
            updateState={updateState}
            logAction={logAction}
          />
        )}

        {activeTab === 'maintenance_health' && (
          <DeveloperMaintenanceHealthTab
            state={state}
            updateState={updateState}
            logAction={logAction}
          />
        )}
      </div>

      {/* 3. Comprehensive Financial Statement Modal */}
      <DeveloperFinancialStatementModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        clinics={state.clinics || []}
      />
    </div>
  );
}
