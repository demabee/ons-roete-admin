import { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";

interface EventFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImage: string | undefined;
  categoryId?: string | undefined;
}

export const CategoryForm: React.FC<EventFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  defaultImage,
  categoryId,
}) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  // const [fileList, setFileList] = useState<File[] | undefined>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultImage) {
      setUrl(defaultImage);
      // setFileList(defaultImage);
    } else {
      setUrl(undefined);
    }
  }, [defaultImage]);

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const snapshot = await uploadBytes(
        ref(storage, `categories/${categoryId}/images/${file.name}`),
        file
      );
      const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
      setUrl(url);
      setUploadingImage(false);
      message.success(`${file.name} uploaded successfully`);
    } catch (error) {
      setUploadingImage(false);
      message.error((error as Error).message);
    }
  };

  const handleImageRemove = async () => {
    try {
      setUrl("");
      // message.success('Image removed successfully');
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Modal
      open={visible}
      title={!isNew ? "Update category" : "Create new category"}
      okText={!isNew ? "Update" : "Create"}
      confirmLoading={loading}
      okButtonProps={{ disabled: loading || !url }}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form
          .validateFields()
          .then(async (values: any) => {
            setLoading(true);
            const process = defaultImage ? onUpdate : onCreate;
            const pload = {
              ...values,
              url,
              id: categoryId,
            };
            try {
              const res = await process(pload);
              console.log(res);
              form.resetFields();
            } catch (e) {
              console.log(e);
            }
            setUrl(undefined);
          })
          .catch((info: any) => {
            console.log("Validate Failed:", info);
          })
          .finally(() => {
            setLoading(false);
          });
      }}
    >
      <Form
        form={form}
        initialValues={{ name: "", nameEs: "", code: "" }}
        layout="vertical"
      >
        <Form.Item style={{ textAlign: "center" }} label="Image">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {url && <img src={url} alt="category" style={{ width: "80px" }} />}
            {url && (
              <Button type="link" danger onClick={handleImageRemove}>
                Remove Image
              </Button>
            )}
          </div>
          <Upload
            accept=".jpg,.jpeg,.png,.gif"
            showUploadList={false}
            beforeUpload={(file) => {
              const isJpgOrPng =
                file.type === "image/jpeg" || file.type === "image/png";
              if (!isJpgOrPng) {
                message.error("You can only upload JPG/PNG file!");
                return false;
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error("Image must smaller than 2MB!");
                return false;
              }
              handleImageUpload(file);
              return false;
            }}
          >
            <Button icon={<PlusOutlined />} loading={uploadingImage}>
              Upload Image
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="nameEs" label="Name (ES)">
          <Input />
        </Form.Item>
        <Form.Item name="code" label="Code">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
