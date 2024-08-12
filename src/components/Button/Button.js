import React from 'react';
import Button from 'react-bootstrap/Button';
import './Button.css';

const CustomButton = ({ label, variant, btnClicked }) => (
  <Button variant={variant} onClick={btnClicked}>
    {label}
  </Button>
);

export default CustomButton;
