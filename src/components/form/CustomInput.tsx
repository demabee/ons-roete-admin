import { Input } from 'antd';
import React, { ReactElement } from 'react';
import styled from 'styled-components';

interface InputTypes {
  label?: string;
  value?: string;
  name?: string;
  disabled?: boolean;
  placeholder: string;
  type: string;
  shape?: 'circle' | 'round' | undefined;
  suffix?: ReactElement;
  prefix?: ReactElement;
  onChange?: () => void;
  style?: any;
  className?: string;
}

const { Search } = Input;

const CustomInput = ({
  label,
  name,
  onChange,
  suffix,
  prefix,
  placeholder,
  className,
  type,
  disabled = false,
  value,
  style
}: InputTypes) => (
  <InputWrapper>
    {label ? <label>{label}</label> : ''}
    {type === 'search' ? (
      <Search className={className} disabled={disabled} placeholder={placeholder} value={value} onChange={onChange} />
    ) : (
      <Input
        type={type}
        disabled={disabled}
        name={name}
        style={style}
        className={className}
        placeholder={placeholder}
        prefix={prefix}
        value={value}
        onChange={onChange}
        suffix={suffix}
      />
    )}
  </InputWrapper>
);

export default CustomInput;

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
