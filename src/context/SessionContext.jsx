import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockEmployee } from '../mock/employeeData';
import { getStageInfo } from '../utils/growthStage';
import { api } from '../api/client';

const SESSION_STORAGE_KEY = 'skillstat_display_name';

const SessionContext = createContext({
  displayName: '',
  setDisplayName: () => {},
  token: null,
  role: null,
  setSessionAuth: () => {},
  signOut: () => {},
  employee: mockEmployee,
  growthStage: getStageInfo(mockEmployee.readinessScore),
  isLoadingEmployee: false,
  employeeError: null,
  refreshEmployee: () => {},
});

export function SessionProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('skillstat_token') || null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem('skillstat_role') || null;
    } catch {
      return null;
    }
  });

  const [displayName, setDisplayNameState] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      return stored && stored.trim() ? stored.trim() : '';
    } catch {
      return '';
    }
  });

  const [employee, setEmployee] = useState(() => {
    try {
      const storedToken = localStorage.getItem('skillstat_token');
      return storedToken ? mockEmployee : null;
    } catch {
      return null;
    }
  });
  const [growthStage, setGrowthStage] = useState(() => {
    try {
      const storedToken = localStorage.getItem('skillstat_token');
      return storedToken ? getStageInfo(mockEmployee.readinessScore) : null;
    } catch {
      return null;
    }
  });
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [employeeError, setEmployeeError] = useState(null);

  const fetchEmployeeData = useCallback(async () => {
    setIsLoadingEmployee(true);
    setEmployeeError(null);
    try {
      const [empData, stageData] = await Promise.all([
        api.getEmployeeMe().catch((err) => {
          console.warn('[SessionContext] Using fallback employee data:', err.message);
          return null;
        }),
        api.getGrowthStage().catch((err) => {
          console.warn('[SessionContext] Using fallback growth stage:', err.message);
          return null;
        })
      ]);

      if (empData) {
        setEmployee(empData);
        // Sync display name if not custom set
        setDisplayNameState((prev) => prev || empData.name);
      }
      if (stageData) {
        setGrowthStage(stageData);
      }
    } catch (err) {
      setEmployeeError(err.message);
    } finally {
      setIsLoadingEmployee(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData, token]);

  const setSessionAuth = ({ token: newToken, role: newRole, employee: newEmp }) => {
    setToken(newToken || null);
    setRole(newRole || null);
    try {
      if (newToken) {
        localStorage.setItem('skillstat_token', newToken);
      } else {
        localStorage.removeItem('skillstat_token');
      }
      if (newRole) {
        localStorage.setItem('skillstat_role', newRole);
      } else {
        localStorage.removeItem('skillstat_role');
      }
      if (newEmp?.name) {
        localStorage.setItem(SESSION_STORAGE_KEY, newEmp.name);
        setDisplayNameState(newEmp.name);
      }
    } catch {
      // Ignore localStorage errors
    }
    if (newEmp) {
      setEmployee(newEmp);
      setGrowthStage(getStageInfo(newEmp.readinessScore || 70));
    }
  };

  const setDisplayName = (newName) => {
    const trimmed = typeof newName === 'string' ? newName.trim() : '';
    const finalName = trimmed || employee.name;
    setDisplayNameState(finalName);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, finalName);
    } catch {
      // Ignore localStorage errors in sandboxed environments
    }
  };

  const signOut = () => {
    setDisplayNameState('');
    setToken(null);
    setRole(null);
    setEmployee(null);
    setGrowthStage(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('skillstat_token');
      localStorage.removeItem('skillstat_role');
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <SessionContext.Provider
      value={{
        displayName,
        setDisplayName,
        token,
        role,
        setSessionAuth,
        signOut,
        employee,
        growthStage,
        isLoadingEmployee,
        employeeError,
        refreshEmployee: fetchEmployeeData,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    return {
      displayName: '',
      setDisplayName: () => {},
      signOut: () => {},
      employee: null,
      growthStage: null,
      isLoadingEmployee: false,
      employeeError: null,
      refreshEmployee: () => {},
    };
  }
  return context;
}

export function useEmployee() {
  const { employee, growthStage, isLoadingEmployee, employeeError, refreshEmployee, token } = useSession();
  const effectiveEmployee = employee || (token ? mockEmployee : null);
  return {
    employee: effectiveEmployee,
    growthStage: growthStage || (effectiveEmployee ? getStageInfo(effectiveEmployee.readinessScore) : null),
    isLoading: isLoadingEmployee,
    error: employeeError,
    refreshEmployee,
  };
}
