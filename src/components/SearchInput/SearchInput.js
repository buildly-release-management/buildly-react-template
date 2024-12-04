import React, { useState } from 'react';
import { Grow, IconButton, TextField } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import './SearchInput.css';

const SearchInput = ({
  options,
  onSearch,
  onHide,
  searchText,
  setSearchText,
}) => {
  const onClose = (e) => {
    onHide(e);
    setSearchText('');
  };

  return (
    <div>
      <Grow appear in timeout={300}>
        <div className="searchInputDiv">
          <TextField
            fullWidth
            variant="standard"
            className="searchTextField"
            InputProps={{
              'aria-label': options.textLabels.toolbar.search,
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
