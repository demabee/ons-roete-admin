import { Form, Input, InputNumber } from 'antd';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

interface InputTypes {
  label?: string;
  value?: string;
  placeholder: string;
  name?: string;
  allowClear?: boolean;
  help?: any;
  hasFeedback?: boolean;
  required?: boolean;
  message?: string;
  disabled?: boolean;
  minValue?: string;
  maxValue?: string;
  type: string;
  validateStatus?: undefined | 'success' | 'warning' | 'error' | 'validating';
  shape?: 'circle' | 'round' | undefined;
  suffix?: ReactElement;
  prefix?: ReactElement;
  prefixNumber?: string;
  step?: string;
  precision?: number;
  onChange?: (e: any) => void;
  style?: any;
  className?: string;
}

const { Search } = Input;

const CustomFormInlineInput = ({
  label,
  name: varName,
  required,
  message,
  help,
  step,
  precision,
  onChange,
  hasFeedback,
  allowClear,
  validateStatus = undefined,
  minValue,
  maxValue,
  suffix,
  disabled = false,
  prefix,
  prefixNumber,
  placeholder,
  className,
  type,
  value,
  style
}: InputTypes) => (
  <InputWrapper>
    {label ? <label>{required ? `${label} *` : label}</label> : ''}
    {type === 'search' ? (
      <Search className={className} placeholder={placeholder} value={value} onChange={onChange} />
    ) : (
      <Form.Item
        name={varName}
        hasFeedback={hasFeedback}
        help={help}
        validateStatus={validateStatus}
        rules={[{ required: required, message: message ?? `${label} is required` }]}
      >
        {type === 'number' ? (
          <InputNumber
            type={type}
            style={style}
            disabled={disabled}
            step={step}
            precision={precision}
            className={className}
            placeholder={placeholder}
            prefix={prefixNumber}
            value={value}
            min={minValue}
            max={maxValue}
            onChange={onChange}
          />
        ) : (
          <Input
            type={type}
            style={style}
            allowClear={allowClear}
            disabled={disabled}
            className={className}
            placeholder={placeholder}
            prefix={prefix}
            value={value}
            onChange={onChange}
            suffix={suffix}
          />
        )}
      </Form.Item>
    )}
  </InputWrapper>
);

export default CustomFormInlineInput;

const InputWrapper = styled.div`
  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
    font-weight: 600;
  }
  .ant-btn {
    height: 28px;
    background-color: white;
    border: 1px solid #38a3a5 !important;
    margin-bottom: 4px;
  }
  .ant-input:placeholder-shown {
    font-size: 12px;
  }
  .ant-form-item {
    margin-bottom: 10px;
  }
  .ant-input-number {
    width: -webkit-fill-available;
  }
`;
