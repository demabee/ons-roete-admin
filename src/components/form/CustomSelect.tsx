import { Select } from 'antd';
import React from 'react';
import styled from 'styled-components';

export interface SelectProps {
  name?: string;
  label?: string;
  options?: any[];
  disabled?: boolean;
  value?: any;
  defaultValue?: any;
  style?: any;
  className?: string;
  showSearch?: any;
  onChange?: (value: any) => void;
}

const { Option } = Select;

export const CustomSelect = (props: SelectProps) => {
  const {
    name,
    disabled = false,
    label,
    defaultValue,
    className,
    style,
    options = [],
    showSearch,
    value,
    onChange,
    ...rest
  } = props;
  return (
    <StyledSelect>
      <label htmlFor={name}>{label ?? ''}</label>
      <Select
        {...rest}
        disabled={disabled}
        id={name}
        showSearch={showSearch}
        style={style}
        defaultValue={defaultValue}
        className={className}
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <Option key={option.id} value={option.id}>
            {option.value}
          </Option>
        ))}
      </Select>
    </StyledSelect>
  );
};

export default CustomSelect;

export const StyledSelect = styled.div`
  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
  }

  .ant-select {
    width: 100%;
    font-size: 12px;
  }

  .dark {
    .ant-select-selector {
      color: #fff !important;
      background-color: #38a3a5 !important;
      padding-bottom: 5px;
    }
  }
`;
