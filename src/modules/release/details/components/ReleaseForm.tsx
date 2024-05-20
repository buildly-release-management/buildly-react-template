import "./ReleaseForm.css";
import Form from "react-bootstrap/Form";
import React, { useEffect, useState } from "react";
import { Release } from "../../../../interfaces/release";
import { Button } from "@mui/material";
import { ReleaseService } from "../../../../services/release.service";

const releaseService = new ReleaseService();

function ReleaseForm({ releasesDetails }: any) {
  const [formData, setFormData] = useState<Release | any>({});

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

  const updateFormData = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitRelease = (event: any) => {
    event.preventDefault();
    releaseService.submitRelease(formData).then();
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
}

export default ReleaseForm;
