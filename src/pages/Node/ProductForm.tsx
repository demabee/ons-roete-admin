/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  Select,
  UploadFile,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Resizer from "react-image-file-resizer"; // Correct import
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
  defaultImages,
  nodeId,
}) => {
  const [urls, setUrls] = useState<string[]>(["", "", ""]);
  const [fileList, setFileList] = useState<
    | UploadFile<any>[]
    | { uid: number; name: string; status: string; url: string }[]
  >([]);
  // const [xs, setXSmall] = useState<string[]>(["", "", ""]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currImages) {
      setFileList(
        currImages.map((c, i) => ({
          uid: i,
          name: extractFileNameFromUrl(c),
          status: "done",
          url: c,
        }))
      ); // Set the state with the UploadFile objects
    } else {
      setFileList([]);
    }
  }, [currImages]);

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
          console.log(uri);
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
    // const storageRef = storage.ref();
    // const imageRef = storageRef.child(`images/${file.name}`);
    // await imageRef.put(file);
    // return await imageRef.getDownloadURL();
    const snapshot = await uploadBytes(
      ref(storage, `nodes/${nodeId}/images/${index}/${file.name}`),
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
      // const snapshot = await uploadBytes(
      //   ref(storage, `nodes/${nodeId}/images/${file.name}`),
      //   file
      // );
      // const url = await getDownloadURL(ref(storage, snapshot.ref.fullPath));
      // await saveImageUrlsToFirestore(urls);
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
        ref(storage, `nodes/${nodeId}/images/${index}/${file.name}`),
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
      title={!isNew ? "Update node" : "Create new node"}
      okText={!isNew ? "Update" : "Create"}
      confirmLoading={loading}
      okButtonProps={{
        disabled:
          loading || !fileList || fileList.length < 1,
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
            const process = !isNew ? onUpdate : onCreate;
            let images = [];
            let currUrls: any = [];
            if (!fileList || fileList.length <= 0) {
              message.error("No uploaded images!");
              return;
            }
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
        <Form.Item
          style={{ textAlign: "center" }}
          label="Upload Images (first image will be your cover image)"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* {urls && urls[0] && (
              <img src={urls[0]} alt="node" style={{ width: "80px" }} />
            )} */}
            {/* {urls && urls[0] && (
              <Button type="link" danger onClick={handleImageRemove}>
                Remove Image
              </Button>
            )} */}
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
                setFileList((state) => [...state] as UploadFile[]);
                message.error(`${file.name} is not PNG/JPG file`);
                return false;
              }
              if (!isFileSizeEnough) {
                setFileList((state) => [...state] as UploadFile[]);
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
          name="name"
          label="Title"
          rules={[
            { required: true, message: "Please enter Title" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="subtitle"
          label="Subtitle"
          rules={[
            { required: true, message: "Please enter Subtitle" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter Description" },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
