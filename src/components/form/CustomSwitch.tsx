import { Switch, Row, Col } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface DatePickerTypes {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: () => void;
  className?: string;
}

const CustomSwitch = ({ label, onChange, defaultChecked, className, checked }: DatePickerTypes) => (
  <CustomSwitchWrapper>
    <Row>
      <Col span={16}>
        <label>{label}</label>
      </Col>
      <Col span={8}>
        <Switch className={className} defaultChecked={defaultChecked} checked={checked} onChange={onChange} />
      </Col>
    </Row>
  </CustomSwitchWrapper>
);

export default CustomSwitch;

const CustomSwitchWrapper = styled.div`
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
