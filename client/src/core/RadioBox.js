import React, { useState } from 'react';
import Radio from '@material-ui/core/Radio';

const RadioBox = ({ prices, handleFilters }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event) => {
    const selectedValue = parseInt(event.target.value, 10); 
    handleFilters(selectedValue);
    setValue(selectedValue);
  };

  return prices.map((p, i) => (
    <div className='ml-5' key={i}>
      <Radio
        checked={value === p._id} 
        onChange={handleChange}
        value={p._id} 
        name={`price-${p._id}`}
        inputProps={{ 'aria-label': p.name }}
      />
      <label className='form-check-label'>{p.name}</label>
    </div>
  ));
};

export default RadioBox;
