import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  Select,
  Spin,
  Avatar,
  UploadFile,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";
import ImageWithCircles from "../../components/images/ImageCoordinates";
import {
  extractFileNameFromUrl,
} from "../../helpers/common";
import useNodes from '../../hooks/useNodes';

interface EventFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  nodes: any[];
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  defaultImage: string | undefined;
  currImages: string[];
  projectId?: string | undefined;
  defCircles: any[];
}

interface Circle {
  x: number;
  y: number;
  id?: string | number;
}

const { Option } = Select;

export const ProjectForm: React.FC<EventFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  nodes: defProducts,
  onUpdate,
  onCancel,
  defaultImage,
  currImages,
  projectId,
  defCircles,
}) => {
  const [circles, setCircles] = useState<Circle[]>(defCircles);
  const [visibleMap, toggleVisibleMap] = useState(false);
  const [currProduct, setCurrProduct] = useState<any>(undefined);
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [nodes, setProducts] = useState<any[]>(defProducts);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<
    | UploadFile<any>[]
    | { uid: number; name: string; status: string; url: string }[]
  >([]);
  const {
    data: nodesData,
    getAll: fetchAllNodes,
    loading: isFetchingAllProducts,
  } = useNodes();

  useEffect(() => {
    fetchAllNodes();
  }, [fetchAllNodes]);

  useEffect(() => {
    if (defCircles) {
      setCircles(defCircles);
      setProducts(defCircles.map((d) => d.id));
    }
  }, [defCircles]);

  useEffect(() => { }, [circles]);

  useEffect(() => {
    if (defaultImage) {
      setUrl(defaultImage);
    } else {
      setUrl(undefined);
    }
  }, [defaultImage]);

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

  function getUniqueElements(arr1: any[], arr2: any[]) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const mergedSet = new Set([
      ...arr1.filter((item) => !set2.has(item)),
      ...arr2.filter((item) => !set1.has(item)),
    ]);

    return Array.from(mergedSet);
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const snapshot = await uploadBytes(
        ref(storage, `maps/${projectId}/images/${file.name}`),
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

  const handleCircles = (x: any, y: any, projectId: any) => {
    if (!circles || circles.length < 1) {
      setCircles([{ x, y, id: projectId }]);
      return;
    }
    const existIndex = circles.findIndex((c) => c.id === projectId);

    if (existIndex !== -1) {
      // If the circle already exists, update its coordinates
      const updatedCircles = [...circles];
      updatedCircles[existIndex] = { x, y, id: projectId };
      setCircles(updatedCircles);
    } else {
      // If the circle doesn't exist, add a new circle
      setCircles((prevCircles) => [...prevCircles, { x, y, id: projectId }]);
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

  const uploadImagesAndStoreInFirestore = async (files: string | any[]) => {
    const imageUrls = [];

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      const snapshot = await uploadBytes(
        ref(storage, `maps/${projectId}/images/${index}/${file.name}`),
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
      title={!isNew ? "Update Map" : "Create new Map"}
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
            let images = [];
            if (!url) {
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

              images = await uploadImagesAndStoreInFirestore(filteredFileList);
              images = [...filteredFileUpload, ...images];
            } else {
              images = await uploadImagesAndStoreInFirestore(fileList);
            }
            const pload = {
              ...values,
              nodes,
              coordinates: circles,
              url,
              id: projectId,
              images,
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
        <Form.Item style={{ textAlign: "center" }} label="Main Image">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {url && <img src={url} alt="Map" style={{ width: "80px" }} />}
            {/* {url && <ImageWithCircles imageUrl={url} />} */}
            {url && (
              <Button type="link" danger onClick={handleImageRemove}>
                Remove Image
              </Button>
            )}
          </div>
          <Upload
            accept=".jpg,.jpeg,.png,.gif"
            listType="picture-circle"
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
            <Button
              icon={<PlusOutlined />}
              size="small"
              loading={uploadingImage}
            >
              Main Image
            </Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter Map name" }]}
        >
          <Input />
        </Form.Item>
        {isFetchingAllProducts ? (
          <Spin />
        ) : (
          <Form.Item name="nodes" label="Nodes">
            <Modal
              open={visibleMap}
              title={`Map ${currProduct?.name || currProduct?.technicalDescription
                }`}
              okText="Update"
              confirmLoading={loading}
              okButtonProps={{
                disabled:
                  loading ||
                  !url ||
                  circles.findIndex((c) => c.id === currProduct?.id) === -1,
              }}
              cancelText="Cancel"
              onCancel={() => {
                toggleVisibleMap(false);
              }}
              onOk={() => {
                const existIndex = circles.findIndex(
                  (c) => c.id === currProduct?.id
                );

                if (existIndex !== -1) {
                  setProducts((prevCircles) => [
                    ...prevCircles,
                    currProduct?.id,
                  ]);
                  toggleVisibleMap(false);
                }
              }}
            >
              {url && (
                <ImageWithCircles
                  imageUrl={url}
                  circles={circles}
                  nodes={(nodesData ?? []).filter(
                    (p: { id: string | number | undefined }) =>
                      circles.map((c) => c.id).includes(p.id)
                  )}
                  handleCircles={handleCircles}
                  projectId={currProduct?.id}
                />
              )}
            </Modal>
            <Select
              showSearch
              style={{ width: "100%" }}
              value={nodes}
              disabled={!url}
              onChange={(val) => {
                const prodId = getUniqueElements(val, nodes ?? []);
                if (!prodId || prodId.length === 0) return;
                if (val.length < nodes.length) {
                  const circs = circles.filter((c) => c.id !== prodId[0]);
                  setCircles(circs);
                  setProducts(circs.map((c) => c.id));
                  return;
                }
                const prod = (nodesData ?? []).find(
                  (p: { id: any }) => p?.id === prodId[0]
                );
                toggleVisibleMap(true);
                setCurrProduct(prod);
              }}
              // onChange={(val) => setProducts(val)}
              mode="multiple"
              placeholder={
                !url ? "Upload Image to add nodes." : "Select nodes"
              }
              optionFilterProp="children"
              onSearch={() => console.log("searched")}
              filterOption={(input: string, option: any) => {
                return (option?.key ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
            >
              {(nodesData ?? [])?.map((item: any) => (
                <Option
                  title={
                    <div>
                      <Avatar
                        src={item?.url ?? item?.thumb ?? item?.medium}
                        size={20}
                      />
                      <span style={{ paddingLeft: 10 }}>
                        {item?.name || item?.technicalDescription}
                      </span>
                    </div>
                  }
                  key={item?.name || item?.technicalDescription}
                  id={item?.id}
                  value={item?.id}
                >
                  <Avatar
                    src={item?.url ?? item?.thumb ?? item?.medium}
                    size={20}
                  />
                  <span style={{ paddingLeft: 10 }}>
                    {item?.name || item?.technicalDescription}
                  </span>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
