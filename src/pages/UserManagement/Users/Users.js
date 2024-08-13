import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useQuery } from 'react-query';
import {
  VerifiedUser as ActivateIcon,
  VerifiedUserOutlined as DeactivateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { IconButton, MenuItem, Select } from '@mui/material';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import useAlert from '@hooks/useAlert';
import { getCoregroupQuery } from '@react-query/queries/coregroup/getCoregroupQuery';
import { getCoreuserQuery } from '@react-query/queries/coreuser/getCoreuserQuery';
import { useEditCoreuserMutation } from '@react-query/mutations/coreuser/editCoreuserMutation';
import { useDeleteCoreuserMutation } from 'react-query/mutations/coreuser/deleteCoreuserMutation';
import { getGroupsFormattedRow, getUserFormattedRows, userColumns } from '@utils/constants';
import '../UserManagementStyles.css';

const Users = () => {
  const user = getUser();
  const { organization } = user;

  const { displayAlert } = useAlert();
  const [rows, setRows] = useState([]);
  const [groups, setGroups] = useState([]);

  const { data: coreuserData, isLoading: isLoadingCoreuser } = useQuery(
    ['users'],
    () => getCoreuserQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { data: coregroupData, isLoading: isLoadingCoregroup } = useQuery(
    ['coregroup'],
    () => getCoregroupQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { mutate: editUserMutation, isLoading: isEditingUser } = useEditCoreuserMutation(displayAlert);

  const { mutate: deleteUserMutation, isLoading: isDeletingUser } = useDeleteCoreuserMutation(displayAlert);

  useEffect(() => {
    if (!_.isEmpty(coreuserData)) {
      const filteredUsers = _.filter(coreuserData, (u) => _.isEqual(u.organization.organization_uuid, organization.organization_uuid));
      const formattedUsers = getUserFormattedRows(filteredUsers);
      const signedInUser = _.remove(formattedUsers, { id: user.id });

      setRows([...signedInUser, ...formattedUsers]);
    }
  }, [coreuserData]);

  useEffect(() => {
    if (!_.isEmpty(coregroupData)) {
      const filteredGroups = _.filter(coregroupData, (cg) => cg.is_global || _.isEqual(cg.organization, organization.organization_uuid));
      setGroups(getGroupsFormattedRow(filteredGroups, organization.name));
    }
  }, [coregroupData]);

  const activateDeactivateUser = (coreuser) => {
    const editData = { id: coreuser.id, is_active: !coreuser.is_active };
    editUserMutation(editData);
  };

  const deleteUser = (coreuser) => {
    const deleteData = { id: coreuser.id };
    deleteUserMutation(deleteData);
  };

  const updatePermissions = (e, coreuser) => {
    const editData = { id: coreuser.id, core_groups: [e.target.value] };
    editUserMutation(editData);
  };

  return (
    <div>
      <DataTableWrapper
        hideAddButton
        centerLabel
        filename="Users"
        tableHeader="Users"
        loading={isLoadingCoreuser
          || isLoadingCoregroup
          || isEditingUser
          || isDeletingUser}
        rows={rows || []}
        columns={[
          ...userColumns(),
          {
            name: 'Permissions',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex];
                return (
                  <Select
                    fullWidth
                    id="coreuser-permissions"
                    disabled={_.isEqual(user.id, coreuser.id) || !coreuser.is_active}
                    value={coreuser.core_groups[0].id}
                    onChange={(e) => updatePermissions(e, coreuser)}
                  >
                    {_.map(groups, (cg) => (
                      <MenuItem key={`coregorup-${cg.id}`} value={cg.id}>
                        {cg.display_permission_name}
                      </MenuItem>
                    ))}
                  </Select>
                );
              },
            },
          },
          {
            name: 'Activate/Deactivate User',
            options: {
              filter: false,
              sort: false,
              empty: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex];
                return (
                  <div className="usersIconDiv">
                    <IconButton
                      disabled={_.isEqual(user.id, coreuser.id)}
                      className="usersIconButton"
                      onClick={(e) => activateDeactivateUser(coreuser)}
                    >
                      {coreuser.is_active ? <ActivateIcon titleAccess="Deactivate" /> : <DeactivateIcon titleAccess="Activate" />}
                    </IconButton>
                  </div>
                );
              },
            },
          },
          {
            name: 'Delete User',
            options: {
              filter: false,
              sort: false,
              empty: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coreuser = rows[dataIndex];
                return (
                  <div className="usersIconDiv">
                    {coreuser.is_active ? null : (
                      <IconButton
                        className="usersIconButton"
                        onClick={(e) => deleteUser(coreuser)}
                      >
                        <DeleteIcon titleAccess="Delete" />
                      </IconButton>
                    )}
                  </div>
                );
              },
            },
          },
        ]}
        extraOptions={{
          setRowProps: (row, dataIndex, rowIndex) => {
            const coreuser = rows[dataIndex];
            const style = { backgroundColor: '#BEBEBA' };
            return !coreuser.is_active || _.isEqual(user.id, coreuser.id) ? { style } : {};
          },
        }}
      />
    </div>
  );
};

export default Users;
