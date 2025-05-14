import { Select, Form } from "antd";
import { startCase } from "lodash";
import styled from "styled-components";

export interface SelectProps {
  name?: string;
  label?: string;
  options?: any[];
  value?: any;
  defaultValue?: any;
  isDisabled?: boolean;
  showSearch?: boolean;
  mode?: "multiple" | "tags";
  style?: any;
  className?: string;
  required?: boolean;
  filterOption?: any;
  onChange?: (value: any) => void;
  onSearch?: (value: any) => void;
}

const { Option } = Select;

export const CustomSelect = (props: SelectProps) => {
  const {
    name,
    label,
    defaultValue,
    showSearch = false,
    required,
    className,
    mode,
    style,
    filterOption,
    isDisabled = false,
    options = [],
    value,
    onChange,
    onSearch,
    ...rest
  } = props;
  return (
    <InputWrapper>
      {label ? <label>{required ? `${label} *` : label}</label> : ""}
      <Form.Item
        {...rest}
        style={style}
        name={name}
        className={className}
        rules={[
          {
            required: required,
            message: `${label ?? startCase(name)} is required`,
          },
        ]}
      >
        <Select
          defaultValue={defaultValue}
          showSearch={showSearch}
          filterOption={filterOption}
          disabled={isDisabled}
          onChange={onChange}
          onSearch={onSearch}
          placeholder={label ?? ""}
          mode={mode}
        >
          {options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </InputWrapper>
  );
};

export default CustomSelect;

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
