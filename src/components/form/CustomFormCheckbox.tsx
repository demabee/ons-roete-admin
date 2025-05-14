import { Checkbox, Form } from 'antd';
import styled from 'styled-components';

interface InputTypes {
  label: string;
  name: string;
  checked: boolean;
  required?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
}

const CustomFormCheckbox = ({
  label,
  onChange,
  checked,
  name,
  required,
}: InputTypes) => (
  <InputWrapper>
    <Form.Item name={name} required={required}>
      <Checkbox checked={checked} onChange={onChange}>
        {label}
      </Checkbox>
    </Form.Item>
  </InputWrapper>
);

export default CustomFormCheckbox;

const InputWrapper = styled.div`
  label {
    padding-left: 3px;
    color: #485253;
    font-size: 12px;
  }
  .ant-form-item {
    margin-bottom: 10px;
  }
  .ant-input:placeholder-shown {
    font-size: 12px;
  }
`;
