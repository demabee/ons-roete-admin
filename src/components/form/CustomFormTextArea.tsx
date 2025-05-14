import { Form, Input } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface InputTypes {
  label: string;
  value?: string;
  placeholder: string;
  rows: number;
  name: string;
  message?: string;
  required?: boolean;
  onChange?: () => void;
  className?: string;
}

const { TextArea } = Input;

const CustomFormTextArea = ({
  label,
  onChange,
  name,
  rows,
  placeholder,
  message,
  className,
  required,
  value
}: InputTypes) => (
  <InputWrapper>
    <label>{label} {required && '*'}</label>
    <Form.Item name={name} rules={[{ required: required, message: message ?? `${label} is required` }]}>
      <TextArea className={className} rows={rows} placeholder={placeholder} value={value} onChange={onChange} />
    </Form.Item>
  </InputWrapper>
);

export default CustomFormTextArea;

const InputWrapper = styled.div`
  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
  }
  .ant-input:placeholder-shown {
    font-size: 12px;
  }
`;
