import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Switch } from '@mui/material';
import { useQuery } from 'react-query';
import useAlert from '@hooks/useAlert';
import DataTableWrapper from '@components/DataTableWrapper/DataTableWrapper';
import { getUser } from '@context/User.context';
import { getCoregroupQuery } from '@react-query/queries/coregroup/getCoregroupQuery';
import { getGroupsFormattedRow } from '@utils/constants';
import { useEditCoregroupMutation } from '@react-query/mutations/coregroup/editCoregroupMutation';

const UserGroups = () => {
  const user = getUser();
  const { organization } = user;

  const { displayAlert } = useAlert();
  const [rows, setRows] = useState([]);

  const { data: coregroupData, isLoading: isLoadingCoregroup } = useQuery(
    ['coregroups'],
    () => getCoregroupQuery(displayAlert),
    { refetchOnWindowFocus: false },
  );

  const { mutate: editGroupMutation, isLoading: isEditingGroup } = useEditCoregroupMutation(displayAlert);

  useEffect(() => {
    if (!_.isEmpty(coregroupData)) {
      const filteredGroups = _.filter(coregroupData, (cg) => cg.is_global || _.isEqual(cg.organization, organization.organization_uuid));
      const grps = getGroupsFormattedRow(filteredGroups, organization.name);
      setRows(_.filter(grps, (g) => !_.isEqual(g.id, 1)));
    }
  }, [coregroupData]);

  const updatePermissions = (e, group) => {
    const editData = {
      id: group.id,
      permissions: {
        ...group.permissions,
        [e.target.name]: e.target.checked,
      },
    };

    editGroupMutation(editData);
  };

  return (
    <div>
      <DataTableWrapper
        hideAddButton
        centerLabel
        filename="User Groups"
        tableHeader="User Groups"
        loading={isLoadingCoregroup || isEditingGroup}
        rows={rows || []}
        columns={[
          {
            name: 'display_permission_name',
            label: 'Group Type',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
            },
          },
          {
            name: 'Create',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coregroup = rows[dataIndex];
                return (
                  <Switch name="create" checked={coregroup.permissions.create} onChange={(e) => updatePermissions(e, coregroup)} />
                );
              },
            },
          },
          {
            name: 'Read',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coregroup = rows[dataIndex];
                return (
                  <Switch name="read" checked={coregroup.permissions.read} onChange={(e) => updatePermissions(e, coregroup)} />
                );
              },
            },
          },
          {
            name: 'Update',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coregroup = rows[dataIndex];
                return (
                  <Switch name="update" checked={coregroup.permissions.update} onChange={(e) => updatePermissions(e, coregroup)} />
                );
              },
            },
          },
          {
            name: 'Delete',
            options: {
              sort: true,
              sortThirdClickReset: true,
              filter: true,
              setCellHeaderProps: () => ({ style: { textAlign: 'center' } }),
              customBodyRenderLite: (dataIndex) => {
                const coregroup = rows[dataIndex];
                return (
                  <Switch name="delete" checked={coregroup.permissions.delete} onChange={(e) => updatePermissions(e, coregroup)} />
                );
              },
            },
          },
        ]}
      />
    </div>
  );
};

export default UserGroups;
