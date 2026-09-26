import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, CheckCircle2, Clock } from 'lucide-react';
import { mockEmployee } from '../mock/employeeData';
import { useCountUp } from '../hooks/useCountUp';
import Card from './common/Card';

/**
 * Shared KPI row used by Dashboard and ProfileView so counters stay in sync.
 */
export default function KpiStatsRow() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const barTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(barTimer);
  }, []);

  const readinessCount = useCountUp(mockEmployee.readinessScore, 800);
  const skillIndexCount = useCountUp(mockEmployee.skillIndex, 800);
  const completedCoursesCount = useCountUp(mockEmployee.completedCoursesCount, 800);
  const weeklyHoursCount = useCountUp(mockEmployee.weeklyHoursLogged, 800, 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="ambient">
        <div className="flex items-center justify-between">
          <span className="typography-caption uppercase tracking-wider text-slate-500">Readiness Score</span>
          <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 typography-stat text-slate-900">{readinessCount}%</p>
        <p className="mt-1 typography-caption text-growth-600 font-semibold flex items-center gap-1">
          <span>+4% from last month</span>
        </p>
      </Card>

      <Card variant="ambient">
        <div className="flex items-center justify-between">
          <span className="typography-caption uppercase tracking-wider text-slate-500">Skill Index</span>
          <div className="rounded-lg bg-growth-50 p-2 text-growth-600">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 typography-stat text-slate-900">
          {skillIndexCount} <span className="text-base font-normal text-slate-400">/ 100</span>
        </p>
        <p className="mt-1 typography-caption text-slate-500">Ranked top 15% in cohort</p>
      </Card>

      <Card variant="ambient">
        <div className="flex items-center justify-between">
          <span className="typography-caption uppercase tracking-wider text-slate-500">Completed Courses</span>
          <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 typography-stat text-slate-900">{completedCoursesCount}</p>
        <p className="mt-1 typography-caption text-slate-500">3 certifications verified</p>
      </Card>

      <Card variant="ambient">
        <div className="flex items-center justify-between">
          <span className="typography-caption uppercase tracking-wider text-slate-500">Weekly Learning Goal</span>
          <div className="rounded-lg bg-opportunity-50 p-2 text-opportunity-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 typography-stat text-slate-900">
          {weeklyHoursCount}h <span className="text-base font-normal text-slate-400">/ {mockEmployee.weeklyGoalHours}h</span>
        </p>
        <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-opportunity-500 rounded-full transition-all duration-700 ease-out"
            style={{
              width: isLoaded
                ? `${Math.min((mockEmployee.weeklyHoursLogged / mockEmployee.weeklyGoalHours) * 100, 100)}%`
                : '0%',
            }}
          ></div>
        </div>
      </Card>
    </div>
  );
}
