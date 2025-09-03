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
import { checkFileSize, extractFileNameFromUrl, validateFileType } from "../../helpers/common";
import useNodes from "../../hooks/useNodes";
import { resizeFile } from '../../helpers/resizer';
import useInterest from '../../hooks/useInterest';

interface DestinationFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: (values: any) => void;
  onUpdate: (values: any) => void;
  onCancel: () => void;
  currImages?: string[];
  defaultImages?: string;
  nodeId?: string;
  destinationId?: string;
}

export const DestinationForm: React.FC<DestinationFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  currImages,
  defaultImages,
  nodeId,
  destinationId,
}) => {
  const [urls, setUrls] = useState<string[]>(["", "", ""]);
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: nodesData, getAll: fetchAllNodes } = useNodes();
  const {
    data: interest,
    getAll: getAllInterest,
    loading: loadingInterest
  } = useInterest();

  useEffect(() => {
    fetchAllNodes();
    getAllInterest();
  }, [fetchAllNodes, getAllInterest]);

  useEffect(() => {
    if (currImages?.length) {
      setFileList(
        currImages.map((c, i) => ({
          uid: i.toString(),
          name: extractFileNameFromUrl(c),
          status: "done",
          url: c,
        }))
      );
    } else {
      setFileList([]);
    }
  }, [currImages]);


  const resizeImage = async (file: any) => {
    if (!file) return [];
    return Promise.all([
      resizeFile(file, 100, 100),   // Thumbnail
      resizeFile(file, 300, 300),   // Medium
      resizeFile(file, 1024, 1024), // High-res
    ]);
  };

  const uploadImage = async (file: any, index: number) => {
    const snapshot = await uploadBytes(
      ref(storage, `destination/${destinationId}/images/${index}/${file.name}`),
      file
    );
    const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
    console.log(url);

    return url;
  };

  const handleImageUpload = async (file: UploadFile) => {
    try {
      setUploadingImage(true);
      const resizedImages = await resizeImage(file);
      const urls = await Promise.all(resizedImages.map(uploadImage));
      setUrls(urls);
      setUploadingImage(false);
      message.success(`${file.name} uploaded successfully`);
      return urls;
    } catch (error) {
      setUploadingImage(false);
      message.error((error as Error).message);
    }
  };

  const uploadImagesAndStoreInFirestore = async (files: string | any[]) => {
    const imageUrls = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const snapshot = await uploadBytes(
        ref(storage, `destination/${destinationId}/images/${index}/${file.name}`),
        file
      );

      const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
      imageUrls.push(url);
    }

    try {
      console.log("Images uploaded and stored in Firestore:", imageUrls);
      return imageUrls;
    } catch (error) {
      console.error("Error uploading images to Firestore:", error);
      return [];
    }
  };

  return (
    <Modal
      open={visible}
      title={isNew ? "Create Destination" : "Update Destination"}
      okText={isNew ? "Create" : "Update"}
      confirmLoading={loading}
      okButtonProps={{
        disabled:
          loading || loadingInterest,
      }}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={async () => {
        try {
          const values = await form.validateFields();
          setLoading(true);

          const process = !isNew ? onUpdate : onCreate;
          let images: string[] = [];
          let currUrls: string[] = ["", "", ""]; // ✅ Default empty

          if (fileList && fileList.length > 0) {
            if (!isNew) {
              const filteredFileList = ((fileList as any[]) ?? []).filter(
                (f: { status: string }) => f?.status !== "done"
              );
              const filteredFileUpload = ((fileList as any[]) ?? [])
                .filter((f: { status: string }) => f?.status === "done")
                .map((f) => f?.url);

              currUrls =
                fileList[0]?.status === "done"
                  ? urls
                  : (await handleImageUpload(fileList[0] as UploadFile)) ?? [];
              images = await uploadImagesAndStoreInFirestore(filteredFileList);
              images = [...filteredFileUpload, ...images];
            } else {
              currUrls = (await handleImageUpload(fileList[0] as UploadFile)) ?? [];
              images = await uploadImagesAndStoreInFirestore(fileList);
            }
          }

          const payload = {
            ...values,
            thumb: currUrls[0] || "",
            medium: currUrls[1] || "",
            highres: currUrls[2] || "",
            id: destinationId,
            images,
          };

          const res = await process(payload);
          console.log("Saved:", res);

          form.resetFields();
          setUrls(["", "", ""]);
          message.success("Saved successfully!");
        } catch (error) {
          console.error("Error:", error);
          message.error((error as Error).message || "Save failed");
        } finally {
          setLoading(false);
          setFileList([]);
        }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Upload Image">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
          </div>
          <Upload
            accept=".jpg,.jpeg,.png,.gif"
            showUploadList={true}
            multiple
            fileList={fileList as UploadFile[]}
            beforeUpload={(file: UploadFile) => {
              const acceptedTypes = ["image/png", "image/jpeg"];
              const isAllowedType = validateFileType(file, acceptedTypes);
              const isFileSizeEnough = checkFileSize(file);
              if (!isAllowedType) {
                message.error(`${file.name} is not PNG/JPG file`);
                return false;
              }
              if (!isFileSizeEnough) {
                message.error("Image must be smaller than 2MB!");
                return false;
              }
              setFileList((state) => [...state, file] as UploadFile[]);
              return false;
            }}
            onRemove={(file: UploadFile) => {
              if (fileList.some((item: any) => item.uid === file.uid)) {
                setFileList((fileList) =>
                  ((fileList as UploadFile[]) ?? []).filter(
                    (item: any) => item.uid !== file.uid
                  )
                );
                return true;
              }
              return false;
            }}
            listType="picture-circle"
          // beforeUpload={() => false}
          >
            <Button
              size="small"
              icon={<PlusOutlined />}
              loading={uploadingImage}
            >
              Image
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="metaInfo" label="Meta Info">
          <Select
            mode="tags"
            options={(interest ?? []).map((item) => ({
              value: item.id,
              label: item.title,
            }))}
            placeholder="Add meta tags (e.g. accommodatie, activiteiten)" />
        </Form.Item>

        <Form.Item name="nodeId" label="Node">
          <Select
            showSearch
            placeholder="Select node"
            optionFilterProp="label"
            options={(nodesData ?? []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
        </Form.Item>

        <Form.Item name={["media", "audioUrl"]} label="Audio URL">
          <Input placeholder="Optional audio link" />
        </Form.Item>

        <Form.Item name={["media", "ebookUrl"]} label="E-book URL">
          <Input placeholder="Optional e-book link" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
