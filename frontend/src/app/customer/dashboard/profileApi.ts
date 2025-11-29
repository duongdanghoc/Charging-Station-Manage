// Re-export user's global profileApi hooks to avoid duplicate slices
export { useGetDashboardQuery, useGetProfileOverviewQuery, useUpdateProfileMutation } from '@/lib/redux/services/profileApi';