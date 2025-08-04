import { useQuery } from 'react-query';
import { useContext } from 'react';
import { UserContext } from '@context/User.context';
import useAlert from '@hooks/useAlert';

/**
 * Custom hook to fetch organization members for the current user's organization
 * @returns {Object} { data: organizationMembers, isLoading, error, refetch }
 */
export const useOrganizationMembers = () => {
  const user = useContext(UserContext);
  const { displayAlert } = useAlert();
  const organizationUuid = user?.organization?.organization_uuid;

  return useQuery(
    ['organizationMembers', organizationUuid],
    async () => {
      const { getCoreuserQuery } = await import('@react-query/queries/coreuser/getCoreuserQuery');
      const allUsers = await getCoreuserQuery(displayAlert);
      
      // Filter users by current organization and only active users
      const filteredUsers = allUsers.filter(orgUser => 
        orgUser.organization && 
        orgUser.organization.organization_uuid === organizationUuid &&
        orgUser.is_active
      );

      // Add GitHub information to each user for easier access in forms
      return filteredUsers.map(orgUser => ({
        ...orgUser,
        github_username: orgUser.github_username || '',
        has_github_profile: orgUser.has_github_profile || false,
        display_name: orgUser.first_name && orgUser.last_name 
          ? `${orgUser.first_name} ${orgUser.last_name}` 
          : orgUser.username || orgUser.email,
        github_display: orgUser.github_username ? ` (GitHub: ${orgUser.github_username})` : ''
      }));
    },
    { 
      refetchOnWindowFocus: false, 
      enabled: !!organizationUuid,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      cacheTime: 10 * 60 * 1000, // 10 minutes cache
    }
  );
};

export default useOrganizationMembers;
