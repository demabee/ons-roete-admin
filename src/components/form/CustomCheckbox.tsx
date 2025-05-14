import Checkbox from 'antd/lib/checkbox/Checkbox';
import classNames from 'classnames';
import React from 'react';
import styled from 'styled-components';

export interface CheckBoxProps {
  name?: string;
  label?: any;
  onChange?: () => void;
  className?: string;
  helpers?: {
    register?: any;
    unregister?: any;
    setValue?: any;
    control?: any;
  };
  value?: boolean;
}

export const CustomCheckbox = (props: CheckBoxProps) => {
  const { name, label, onChange, helpers, value } = props;

  const className = classNames('mcp-checkbox', 'form-check', props.className);

  return (
    <StyledCheckBox className={className}>
      <Checkbox
        ref={helpers?.register()}
        type="checkbox"
        id={name}
        name={name}
        className="form-check-input"
        onChange={onChange}
        checked={value}
      >
        <div className="label">
          {label}
        </div>
      </Checkbox>
    </StyledCheckBox>
  );
};

export default CustomCheckbox;

const StyledCheckBox = styled.div`
  .label {
    font-size: 12px;
    color: #485253;
    font-weight: 700;
  }
`;
