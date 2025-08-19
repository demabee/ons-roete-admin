import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  UploadFile,
  Select,
  Button
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";
import { extractFileNameFromUrl } from "../../helpers/common";
import useNodes from '../../hooks/useNodes';

interface GalleryFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImages?: string;
  currImages?: string[];
  nodeId?: string;
  galleryId?: string;
}

export const GalleryForm: React.FC<GalleryFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  currImages,
  defaultImages,
  nodeId,
  galleryId,
}) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    data: nodesData,
    getAll: fetchAllNodes,
  } = useNodes();

  useEffect(() => {
    fetchAllNodes();
  }, [fetchAllNodes]);

  useEffect(() => {
    if (currImages?.length) {
      setFileList([
        {
          uid: "1",
          name: extractFileNameFromUrl(currImages[0]),
          status: "done",
          url: currImages[0],
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [currImages]);

  useEffect(() => {
    if (defaultImages?.length) {
      setUrl(defaultImages);
    } else {
      setUrl('');
    }
  }, [defaultImages]);

  const uploadImage = async (file: File) => {
    const fileRef = ref(storage, `galleries/${galleryId}/images/${file.name}`);
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
            url,
            id: galleryId,
            node: selectedNode
          };
          await process(payload);
          form.resetFields();
          setUrl(undefined);
          setFileList([]);
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
              <>
                <img
                  src={url}
                  alt="Preview"
                  style={{ width: 80, height: "auto", marginBottom: 8, borderRadius: 4 }}
                />
                <Button type="link" danger onClick={handleImageRemove}>
                  Remove Image
                </Button>
              </>
            </div>
          ) :
            <Upload
              accept=".jpg,.jpeg,.png"
              listType="picture-card"
              showUploadList={false}
              fileList={fileList}

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
              {fileList.length >= 1 ? null : (
                <Button
                  icon={<PlusOutlined />}
                  size="small"
                  loading={uploadingImage}
                >
                  {uploadingImage ? "Uploading..." : "Upload"}
                </Button>
              )}
            </Upload>
          }

        </Form.Item>

        <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter Title" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter Description" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="node" label="node">
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Select node"
            optionLabelProp="label"
            filterOption={(input, option) =>
              (typeof option?.label === "string"
                ? option.label.toLowerCase()
                : String(option?.label)
              ).includes(input.toLowerCase())
            }
            onChange={(val) => {
              setSelectedNode(val);
            }}
          >
            {(nodesData ?? []).map((item) => (
              <Select.Option
                key={item.id}
                value={item.id}
                label={item.name}
              >
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
