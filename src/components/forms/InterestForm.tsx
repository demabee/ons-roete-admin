import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";

interface InterestFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImages?: string;
  currImage?: string;
  nodeId?: string;
  interestId?: string;
}

export const InterestForm: React.FC<InterestFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  currImage,
  defaultImages,
  nodeId,
  interestId,
}) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currImage?.length) {
      setUrl(currImage);
    } else if (defaultImages?.length) {
      setUrl(defaultImages); // fallback to default
    } else {
      setUrl(''); // empty if none
    }
  }, [currImage, defaultImages]);


  const uploadImage = async (file: File) => {
    const fileRef = ref(storage, `interest/${interestId}/images/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const url = await uploadImage(file);
      setUrl(url);
      message.success(`${file.name} uploaded successfully`);
      return url;
    } catch (error) {
      message.error((error as Error).message);
      return [];
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = async () => {
    try {
      setUrl(undefined);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <Modal
      open={visible}
      title={!isNew ? "Update image info" : "Upload new image info"}
      okText={!isNew ? "Update" : "Create"}
      confirmLoading={loading}
      okButtonProps={{ disabled: loading || !url }}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form.validateFields().then(async (values: any) => {
          setLoading(true);
          const process = !isNew ? onUpdate : onCreate;
          const payload = {
            ...values,
            imageUrl: url,
            id: interestId
          };
          await process(payload);
          form.resetFields();
          setUrl(undefined);
          setLoading(false);
        }).catch(() => setLoading(false));
      }}
    >
      <Form form={form} initialValues={{ name: "", description: "" }} layout="vertical">
        <Form.Item label="Upload Image" required>
          {url ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginBottom: 12,
              }}
            >
              <img
                src={url}
                alt="Preview"
                style={{ width: 80, height: "auto", marginBottom: 8, borderRadius: 4 }}
              />
              <Button type="link" danger onClick={handleImageRemove}>
                Remove Image
              </Button>
            </div>
          ) : (
            <Upload
              accept=".jpg,.jpeg,.png"
              listType="picture-card"
              showUploadList={false}
              maxCount={1} // ✅ allow only 1 file
              beforeUpload={(file) => {
                const isJpgOrPng =
                  file.type === "image/jpeg" || file.type === "image/png";
                if (!isJpgOrPng) {
                  message.error("You can only upload JPG/PNG file!");
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error("Image must be smaller than 2MB!");
                  return Upload.LIST_IGNORE;
                }
                handleImageUpload(file);
                return false; // ✅ prevent auto upload
              }}
            >
              <Button
                icon={<PlusOutlined />}
                size="small"
                loading={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Upload"}
              </Button>
            </Upload>
          )}
        </Form.Item>

        <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter Title" }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
