import { Button, Modal } from 'antd';
import React from 'react';

interface Props {
  title: string;
  open: boolean;
  width?: string;
  confirmLoading: boolean;
  withFooter?: boolean;
  handleOk: () => void;
  handleCancel: () => void;
  children?: React.ReactNode;
}

const CustomModal: React.FC<Props> = ({
  title,
  open,
  width,
  withFooter = true,
  confirmLoading,
  handleOk,
  handleCancel,
  children,
}) => {
  return (
    <>
      <Modal
        title={title}
        open={open}
        onOk={handleOk}
        width={width}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={
          withFooter && [
            <Button key='back' onClick={handleOk}>
              Cancel
            </Button>,
            <Button key='submit' type='primary' onClick={handleOk}>
              Add
            </Button>,
          ]
        }
      >
        {children}
      </Modal>
    </>
  );
};

export default CustomModal;
