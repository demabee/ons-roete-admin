import { DatePicker, Form } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface DatePickerTypes {
  label?: string;
  value?: any;
  name?: string;
  placeholder: string;
  required?: boolean;
  onChange?: (value: any) => void;
  className?: string;
  disabledDate?: any;
}

const CustomFormDatePicker = ({
  label,
  name,
  required,
  onChange,
  placeholder,
  className,
  value,
  disabledDate
}: DatePickerTypes) => (
  <DatePickerWrapper>
    {label ? (
      <label>
        {label} {required && '*'}
      </label>
    ) : (
      ''
    )}
    <Form.Item name={name} rules={[{ required: required, message: `${label ?? name} is required` }]}>
      <DatePicker
        name={name}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabledDate={disabledDate}
      />
    </Form.Item>
  </DatePickerWrapper>
);

export default CustomFormDatePicker;

const DatePickerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 5px;

  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .ant-picker {
    width: 100%;
  }
  .ant-form-item {
    margin-bottom: 10px;
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
