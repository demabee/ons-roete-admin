import React from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface ImportDataProps {
  onUpload: (file: File) => void;
}

const ImportData: React.FC<ImportDataProps> = ({ onUpload }) => {
  const handleFileChange = (info: any) => {
    if (info.file.status === "done") {
      // File has been uploaded successfully
      onUpload(info.file.originFileObj);
    }
  };

  return (
    <Upload
      onChange={handleFileChange}
      beforeUpload={() => false} // Prevent default upload behavior
    >
      <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>
  );
};

export default ImportData;
