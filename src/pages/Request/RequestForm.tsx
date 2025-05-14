import { useState, useEffect } from "react";
import { Modal, Form, Input, Upload, Button, message, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";
import { StyledSelect } from "../../components/form/CustomSelect";

interface EventFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  category: string;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImage: string | undefined;
  nodeId?: string | undefined;
}

export const RequestForm: React.FC<EventFormProps> = ({
  form,
  isNew,
  visible,
  category: defaultCategory,
  onCreate,
  onUpdate,
  onCancel,
  defaultImage,
  nodeId,
}) => {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(defaultCategory);
  // const [fileList, setFileList] = useState<File[] | undefined>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultCategory) {
      console.log(defaultCategory);
      setCategory(defaultCategory);
    } else {
      setCategory(undefined);
    }
  }, [defaultCategory]);

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
        ref(storage, `nodes/${nodeId}/images/${file.name}`),
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

  // const handleImageRemove = async (file: any) => {
  //   try {
  //     // setFileList(fileList.filter((f) => f.uid !== file.uid));
  //   } catch (error) {
  //     message.error((error as Error).message);
  //   }
  // };
  return (
    <Modal
      open={visible}
      title={!isNew ? "Update node" : "Create new node"}
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
              category,
              id: nodeId,
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
      <Form form={form} layout="vertical">
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
            {url && <img src={url} alt="node" style={{ width: "80px" }} />}
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
        <Form.Item
          name="technicalDescription"
          label="Technical Description"
          rules={[
            { required: true, message: "Please enter Technical Description" },
          ]}
        >
          <Input />
        </Form.Item>
        {/* <Select
          defaultValue={category}
          style={{ minWidth: 115 }}
          onChange={(val) => setCategory(val)}
          options={[
            { value: "sofas", label: "Sofas" },
            { value: "tables", label: "Tables" },
            { value: "chairs", label: "Chairs" },
            { value: "accessories", label: "Accessories" },
            { value: "outdoor", label: "Outdoor" },
          ]}
        /> */}
        <StyledSelect>
          <label htmlFor="category">Category</label>
          <Select
            // label="Category"
            value={category}
            style={{ minWidth: 115 }}
            onChange={(val) => {
              setCategory(val);
            }}
            options={[
              { value: "sofas", label: "Sofas" },
              { value: "tables", label: "Tables" },
              { value: "chairs", label: "Chairs" },
              { value: "accessories", label: "Accessories" },
              { value: "outdoor", label: "Outdoor" },
            ]}
          />
        </StyledSelect>
        <br />
        <Form.Item
          name="bANQADescriptionENG"
          label="Description (ENG)"
          rules={[
            { required: true, message: "Please enter Description (ENG)" },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="bANQADescriptionES"
          label="Description (ES)"
          rules={[{ required: true, message: "Please enter Description (ES)" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="itemDimensions(Cm)" label="Item Dimensions (cm)">
          <Input />
        </Form.Item>
        <Form.Item name="tRADE" label="TRADE">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="rRP" label="RRP">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="dSG" label="DSG">
          <Input type="number" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
