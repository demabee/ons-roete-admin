import { DatePicker } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface DatePickerTypes {
  label?: string;
  value?: any;
  placeholder: string;
  onChange?: any;
  className?: string;
}

const CustomDatePicker = ({ label, onChange, placeholder, className, value }: DatePickerTypes) => (
  <DatePickerWrapper>
    {label ? <label>{label}</label> : ''}
    <DatePicker className={className} placeholder={placeholder} value={value} onChange={onChange} />
  </DatePickerWrapper>
);

export default CustomDatePicker;

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;

  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .ant-btn {
    height: 28px;
    background-color: white;
    border: 1px solid #38a3a5 !important;
    margin-bottom: 4px;
  }
  .ant-input {
    margin-top: 5px;
    height: 28px;
    border: 1px solid #38a3a5;
    margin-bottom: 10px;
  }
  .ant-input:placeholder-shown {
    font-size: 12px;
  }
`;
