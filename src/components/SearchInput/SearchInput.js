import React, { useState } from 'react';
import { Grow, IconButton, TextField } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import './SearchInput.css';

const SearchInput = ({
  options = {},
  onSearch,
  onHide,
  searchText,
  setSearchText,
  placeholder = "Search...",
}) => {
  const onClose = (e) => {
    onHide(e);
    setSearchText('');
  };

  // Safely access the aria-label or use placeholder as fallback
  const ariaLabel = options?.textLabels?.toolbar?.search || placeholder;

  return (
    <div>
      <Grow appear in timeout={300}>
        <div className="searchInputDiv">
          <TextField
            fullWidth
            variant="standard"
            className="searchTextField"
            placeholder={placeholder}
            InputProps={{
              'aria-label': ariaLabel,
            }}
            value={searchText || ''}
            onChange={(e) => {
              onSearch(e.target.value);
              setSearchText(e.target.value);
            }}
          />
          <IconButton className="searchClearIcon" onClick={onClose}>
            <ClearIcon />
          </IconButton>
        </div>
      </Grow>
    </div>
  );
};

export default SearchInput;
