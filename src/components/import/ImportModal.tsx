import React, { useState } from "react";
import { Button, Modal } from "antd";
import ExcelReader from "./ExcelReader";

const ImportModal: React.FC<any> = ({ callback, nodes }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    callback();
    setModalVisible(false);
  };

  return (
    <>
      <Button type="primary" onClick={handleOpenModal}>
        Import
      </Button>
      <Modal
        title="Import Data"
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {/* <ImportData onUpload={handleFileChange} /> */}
        <ExcelReader callback={handleCloseModal} nodes={nodes} />
      </Modal>
    </>
  );
};

export default ImportModal;
