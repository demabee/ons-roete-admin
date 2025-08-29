/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  UploadFile,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Resizer from "react-image-file-resizer";
import { storage } from "../../firebase/config";
import { checkFileSize, extractFileNameFromUrl, validateFileType } from "../../helpers/common";

interface EventFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImages: string[];
  currImages: string[];
  mapImage?: string;
  thumb?: string[];
  nodeId?: string | undefined;
}

export const ProductForm: React.FC<EventFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  currImages,
  mapImage,
  defaultImages,
  nodeId,
}) => {
  const [urls, setUrls] = useState<string[]>(["", "", ""]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mapImgFile, setMapImgFile] = useState<UploadFile[]>([]); // 🆕 for mapImg

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingMapImg, setUploadingMapImg] = useState(false); // 🆕
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currImages) {
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

    if (mapImage) {
      setMapImgFile([
        {
          uid: "-1",
          name: extractFileNameFromUrl(mapImage),
          status: "done",
          url: mapImage,
        },
      ]);
    } else {
      setMapImgFile([]);
    }
  }, [currImages, mapImage]);

  useEffect(() => {
    if (defaultImages) {
      setUrls(defaultImages);
    } else {
      setUrls(["", "", ""]);
    }
  }, [defaultImages]);

  const resizeFile = (file: Blob, maxWidth: number, maxHeight: number) => {
    return new Promise((resolve, reject) => {
      Resizer.imageFileResizer(
        file,
        maxWidth,
        maxHeight,
        "JPEG",
        80,
        0,
        (uri) => {
          resolve(uri);
        },
        "file"
      );
    });
  };

  const resizeImage = (file: any) => {
    if (!file) return ["", "", ""];
    return Promise.all([
      resizeFile(file, 100, 100), // Thumbnail size
      resizeFile(file, 300, 300), // Medium size
      resizeFile(file, 1024, 1024), // High-resolution size
    ]);
  };

  const uploadImage = async (file: any, index: number) => {
    const snapshot = await uploadBytes(
      ref(storage, `nodes/${nodeId}/images/${index}/${file.name}`),
      file
    );
    const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
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

  const handleMapImgUpload = async (file: UploadFile) => { // 🆕
    try {
      setUploadingMapImg(true);
      const snapshot = await uploadBytes(
        ref(storage, `nodes/${nodeId}/map/${file.name}`),
        file as any
      );
      const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
      setUploadingMapImg(false);
      message.success(`${file.name} uploaded successfully`);
      return url;
    } catch (error) {
      setUploadingMapImg(false);
      message.error((error as Error).message);
      return "";
    }
  };

  const uploadImagesAndStoreInFirestore = async (files: string | any[]) => {
    const imageUrls = [];
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const snapshot = await uploadBytes(
        ref(storage, `nodes/${nodeId}/images/${index}/${file.name}`),
        file
      );
      const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
      imageUrls.push(url);
    }
    return imageUrls;
  };

  return (
    <Modal
      open={visible}
      title={!isNew ? "Update node" : "Create new node"}
      okText={!isNew ? "Update" : "Create"}
      confirmLoading={loading}
      okButtonProps={{
        disabled: loading || !fileList || fileList.length < 1,
      }}
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
            if (!fileList || fileList.length < 1) {
              message.error("No uploaded images!");
              return;
            }

            // Upload map image if selected 🆕
            let mapImgUrl = "";
            if (mapImgFile.length > 0) {
              mapImgUrl = await handleMapImgUpload(mapImgFile[0]);
            }

            const process = !isNew ? onUpdate : onCreate;
            let images = [];
            let currUrls: any = [];
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
                  : await handleImageUpload(fileList[0] as UploadFile);
              images = await uploadImagesAndStoreInFirestore(filteredFileList);
              images = [...filteredFileUpload, ...images];
            } else {
              currUrls = await handleImageUpload(fileList[0] as UploadFile);
              images = await uploadImagesAndStoreInFirestore(fileList);
            }
            if (!currUrls) {
              message.error("No uploaded images!");
              return;
            }
            const pload = {
              ...values,
              thumb: currUrls[0] || "",
              medium: currUrls[1] || "",
              highres: currUrls[2] || "",
              id: nodeId,
              images,
              mapImg: mapImgUrl, // 🆕 include map image in payload
            };
            try {
              const res = await process(pload);
              console.log(res);
              form.resetFields();
            } catch (e) {
              console.log(e);
            }
            setUrls(["", "", ""]);
          })
          .catch((info: any) => {
            console.log("Validate Failed:", info);
          })
          .finally(() => {
            setLoading(false);
            setFileList([]);
            setMapImgFile([]); // 🆕 reset mapImg after submit
          });
      }}
    >
      <Form
        form={form}
        initialValues={{
          name: "",
          subtitle: "",
          description: "",
        }}
        layout="vertical"
      >
        {/* Existing Upload */}
        <Form.Item
          style={{ textAlign: "center" }}
          label="Upload Images (first image will be your cover image)"
        >
          <Upload
            accept=".jpg,.jpeg,.png,.gif,.webp" // 🆕 allow webp
            showUploadList={true}
            multiple
            fileList={fileList}
            beforeUpload={(file: UploadFile) => {
              const acceptedTypes = ["image/png", "image/jpeg", "image/webp"]; // 🆕
              const isAllowedType = validateFileType(file, acceptedTypes);
              const isFileSizeEnough = checkFileSize(file);
              if (!isAllowedType) {
                message.error(`${file.name} is not PNG/JPG/WEBP file`);
                return false;
              }
              if (!isFileSizeEnough) {
                message.error("Image must be smaller than 2MB!");
                return false;
              }
              setFileList((state) => [...state, file]);
              return false;
            }}
            onRemove={(file: UploadFile) => {
              setFileList((fileList) =>
                fileList.filter((item) => item.uid !== file.uid)
              );
              return true;
            }}
            listType="picture-circle"
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

        {/* 🆕 Map Image Upload */}
        <Form.Item
          style={{ textAlign: "center" }}
          label="Upload Map Image"
        >
          <Upload
            accept=".jpg,.jpeg,.png,.gif,.webp" // 🆕 allow webp
            showUploadList={true}
            maxCount={1} // 🆕 only one image
            fileList={mapImgFile}
            beforeUpload={(file: UploadFile) => {
              const acceptedTypes = ["image/png", "image/jpeg", "image/webp"];
              const isAllowedType = validateFileType(file, acceptedTypes);
              const isFileSizeEnough = checkFileSize(file);
              if (!isAllowedType) {
                message.error(`${file.name} is not PNG/JPG/WEBP file`);
                return false;
              }
              if (!isFileSizeEnough) {
                message.error("Image must be smaller than 2MB!");
                return false;
              }
              setMapImgFile([file]); // 🆕 replace existing file
              return false;
            }}
            onRemove={(file: UploadFile) => {
              setMapImgFile([]);
              return true;
            }}
            listType="picture-card"
          >
            {!mapImgFile.length && (
              <Button
                size="small"
                icon={<PlusOutlined />}
                loading={uploadingMapImg}
              >
                Map Image
              </Button>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="name"
          label="Title"
          rules={[{ required: true, message: "Please enter Title" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="subtitle"
          label="Subtitle"
          rules={[{ required: true, message: "Please enter Subtitle" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter Description" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="url"
          label="URL Endpoint"
          rules={[{ required: true, message: "Please enter URL Endpoint" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
