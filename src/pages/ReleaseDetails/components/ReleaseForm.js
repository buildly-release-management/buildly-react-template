import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import {
  Autocomplete, Button, Checkbox, TextField,
} from '@mui/material';
import Loader from '@components/Loader/Loader';
import { useUpdateReleaseMutation } from '@react-query/mutations/release/updateReleaseMutation';
import './ReleaseForm.css';
import _ from 'lodash';
import { useQuery } from 'react-query';
import { getAllFeatureQuery } from '@react-query/queries/release/getAllFeatureQuery';
import { CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from '@mui/icons-material';

const ReleaseForm = ({ releasesDetails, displayAlert }) => {
  const [formData, setFormData] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;

  const { data: features, isLoading: isAllFeatureLoading } = useQuery(
    ['allFeatures', releasesDetails?.product_uuid],
    () => getAllFeatureQuery(releasesDetails?.product_uuid, displayAlert),
    { refetchOnWindowFocus: false, enabled: !_.isEmpty(releasesDetails?.product_uuid) && !_.isEqual(_.toNumber(releasesDetails?.product_uuid), 0) },
  );

  // Initialize selected features
  useEffect(() => {
    resetForm();
    if (!_.isEmpty(features)) {
      const selected = features.filter((featureObj) => releasesDetails.features.includes(featureObj.feature_uuid));
      setSelectedFeatures(selected);
    }
  }, [features]);

  const { mutate: updateReleaseMutation, isLoading: isUpdatingReleaseLoading } = useUpdateReleaseMutation(releasesDetails?.release_uuid, displayAlert);

  const updateFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitRelease = (event) => {
    event.preventDefault();
    updateReleaseMutation(formData);
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      release_uuid: releasesDetails?.release_uuid,
      name: releasesDetails?.name,
      description: releasesDetails?.description,
      release_date: releasesDetails?.release_date,
      features: releasesDetails?.features,
    });
  };

  return (
    <>
      {(isUpdatingReleaseLoading || isAllFeatureLoading) && <Loader open={isUpdatingReleaseLoading || isAllFeatureLoading} />}
      <Form noValidate>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name*</Form.Label>
          <Form.Control
            size="sm"
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            required
            onChange={(event) => updateFormData(event)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="description"
            value={formData.description}
            onChange={(event) => updateFormData(event)}
          />
        </Form.Group>
        <Form.Group className="mb-3 col-md-6 col-sm-12" controlId="date">
          <Form.Label>Release date*</Form.Label>
          <Form.Control
            size="sm"
            type="date"
            placeholder="Release date"
            name="release_date"
            value={formData.release_date}
            required
            onChange={(event) => updateFormData(event)}
          />
        </Form.Group>
        <Form.Group
          className="mb-3"
          controlId="features"
        >
          <Form.Label>Add Features</Form.Label>
          <Autocomplete
            multiple
            id="features"
            disableCloseOnSelect
            filterSelectedOptions
            options={_.orderBy(features, ['name'], ['asc'])}
            getOptionLabel={(option) => option && option.name}
            value={selectedFeatures}
            onChange={(event, newValue) => {
              if (_.size(newValue) > _.size(selectedFeatures)) {
                setSelectedFeatures([
                  ...selectedFeatures,
                  _.last(newValue),
                ]);
              } else {
                setSelectedFeatures(newValue);
              }
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={uncheckedIcon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            renderInput={(params) => <TextField {...params} />}
          />
        </Form.Group>
      </Form>

      <div className="d-flex flex-row justify-content-end">
        <Button
          className="mx-2"
          type="button"
          variant="outlined"
          color="primary"
          size="small"
          onClick={resetForm}
        >
          Cancel
        </Button>
        <Button
          className="mx-2"
          type="button"
          variant="contained"
          color="primary"
          size="small"
          disabled={!formData.name || !formData.release_date}
          onClick={(event) => submitRelease(event)}
        >
          Save
        </Button>
      </div>
    </>
  );
};

export default ReleaseForm;
