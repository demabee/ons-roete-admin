import { InboxOutlined } from '@ant-design/icons';
import { Form, Upload } from 'antd';
import React from 'react';
import styled from 'styled-components';

export interface Props {
  name?: string;
  valuePropName?: string;
  label?: string;
  action?: any;
  headers?: any;
  fileList?: any;
  beforeUpload?: any;
  onRemove?: any;
  value?: any;
  defaultValue?: any;
  style?: any;
  className?: string;
  normFile?: (value: any) => void;
}

function CustomFormDropzone({
  name,
  label,
  action,
  headers,
  beforeUpload,
  fileList,
  onRemove,
  normFile
}: Props) {
  return (
    <DropzoneWrapper>
      {label && <label htmlFor={name}>{label ?? ''}</label>}
      <Form.Item>
        <Form.Item name={name} valuePropName="file" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger
            action={action}
            multiple
            headers={headers}
            fileList={fileList}
            beforeUpload={(args) => beforeUpload(args)}
            onRemove={(args) => onRemove(args)}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Drop files here or click to upload</p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
    </DropzoneWrapper>
  );
}

export default CustomFormDropzone;

const DropzoneWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 150px;

  label {
    margin-bottom: 10px;
    font-weight: 600;
  }
`;
