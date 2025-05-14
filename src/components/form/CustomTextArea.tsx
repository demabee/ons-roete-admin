import { Input } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface InputTypes {
  label: string;
  value?: string;
  placeholder: string;
  rows: number;
  onChange?: () => void;
  className?: string;
}

const { TextArea } = Input;

const CustomTextArea = ({ label, onChange, rows, placeholder, className, value }: InputTypes) => (
  <InputWrapper>
    <label>{label}</label>
    <TextArea
      className={className}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </InputWrapper>
);

export default CustomTextArea;

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
