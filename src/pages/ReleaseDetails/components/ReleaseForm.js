import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Button } from '@mui/material';
import Loader from '@components/Loader/Loader';
import { useUpdateReleaseMutation } from '@react-query/mutations/release/updateReleaseMutation';
import './ReleaseForm.css';

const ReleaseForm = ({ releasesDetails, displayAlert }) => {
  const [formData, setFormData] = useState({});

  const { mutate: updateReleaseMutation, isLoading: isUpdatingReleaseLoading } = useUpdateReleaseMutation(releasesDetails.release_uuid, displayAlert);

  useEffect(() => {
    setFormData({});
    if (releasesDetails) {
      setFormData({
        ...formData,
        release_uuid: releasesDetails.release_uuid,
        name: releasesDetails.name,
        description: releasesDetails.description,
        release_date: releasesDetails.release_date,
      });
    }
  }, []);

  const updateFormData = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  console.log(formData);
  const submitRelease = (event) => {
    event.preventDefault();
    updateReleaseMutation(formData);
  };

  const resetForm = () => {
    setFormData({
      ...formData,
      release_uuid: releasesDetails.release_uuid,
      name: releasesDetails.name,
      description: releasesDetails.description,
      release_date: releasesDetails.release_date,
    });
  };

  return (
    <>
      {isUpdatingReleaseLoading && <Loader open={isUpdatingReleaseLoading} />}
      <Form noValidate>
        <Form.Group className="mb-3 col-md-6 col-sm-12" controlId="name">
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
        <Form.Group className="mb-3 col-md-3 col-sm-12" controlId="date">
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
