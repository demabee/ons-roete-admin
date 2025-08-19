import { useState, useEffect, useMemo } from "react";
import {
  Button,
  message,
  Divider,
  Row,
  Col,
  Popconfirm,
  Spin,
  Space,
  Input,
  Avatar,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import DataTable from "react-data-table-component";
import {
  Timestamp,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import { v4 as uuidv4 } from "uuid";
import { GalleryForm } from '../components/forms/GalleryForm';
import { GalleryType } from '../types/Gallery';
import useGallery from '../hooks/useGallery';

const { Search } = Input;

const Gallery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currGallery, setCurrGallery] = useState<GalleryType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [form] = useForm();
  const {
    data: gallery,
    getAll: getAllGallery,
    loading: loadingGallery
  } = useGallery();

  const filteredProducts = useMemo(() => {
    const tempGallery = gallery;
    return !searchTerm
      ? tempGallery ?? []
      : (tempGallery ?? []).filter(
        (item: GalleryType) => {
          const titleMatch = (item?.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const descriptionMatch = typeof item?.description === "string"
            ? item.description.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
          return titleMatch || descriptionMatch;
        }
      );
  }, [searchTerm, gallery]);

  const columns: any[] = [
    {
      name: "Image",
      dataIndex: "url",
      sortable: true,
      key: "url",
      selector: (row: { url: string; thumb?: string }) =>
        row?.url ? <Avatar src={row?.url} size={40} shape="square" /> : "-",
    },
    {
      name: "Title",
      width: "20%",
      dataIndex: "name",
      sortable: true,
      key: "name",
      selector: (row: { title: string; }) =>
        row?.title || "-",
    },
    {
      name: "Description",
      dataIndex: "description",
      sortable: true,
      key: "description",
      selector: (row: { description: string; }) =>
        row?.description || "-",
    },
    {
      name: "Date created",
      dataIndex: "dateCreated",
      sortable: true,
      key: "dateCreated",
      selector: (row: { dateCreated: Timestamp }) =>
        row?.dateCreated
          ? dayjs(row?.dateCreated?.toDate()).format("YYYY-MM-DD hh:mm a")
          : dayjs().format("YYYY-MM-DD hh:mm a"),
    },
    {
      name: "Actions",
      width: "25%",
      key: "action",
      cell: (row: any, record: GalleryType) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={() => {
              setCurrGallery(row);
              showModal(row);
            }}
          >
            Edit
          </Button>
          <Divider type="vertical" />
          <Button
            type="default"
            size="small"
            loading={isLoading}
            style={{
              width: 130,
              backgroundColor: row?.hideFromList ? "white" : "gray",
              color: row?.hideFromList ? "#001529" : "white",
              fontSize: 12,
            }}
            onClick={async () => {
              setIsLoading(true);
              await setDoc(
                doc(db, "nodes", row?.id),
                {
                  hideFromList: !row?.hideFromList,
                },
                { merge: true }
              );
              await getAllGallery();
              setIsLoading(false);
            }}
          >
            {row?.hideFromList ? "Display in List" : "Remove from List"}
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this node?"
            onConfirm={() => {
              handleDelete(row?.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              style={{
                backgroundColor: "#a41111",
                borderColor: "#a41111",
                color: "#fff",
                fontSize: 12,
              }}
              loading={isLoading}
              type="default"
            >
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    getAllGallery();
  }, [getAllGallery]);

  useEffect(() => {
    if (currGallery?.images) {
      setProcessedFiles(currGallery?.images);
    }
  }, [currGallery?.images]);

  const showModal = (node?: any) => {
    if (node) {
      const pload = {
        ...node,
      };
      form.setFieldsValue(pload);
    }
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = async (data: GalleryType) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "gallery", data.id), {
        ...data,
        dateCreated: serverTimestamp(),
      });
      message.success("Image info created successfully");
      setVisible(false);
      await getAllGallery();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nodeId: any) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "nodes", nodeId));
      message.success("Node deleted successfully");
      await getAllGallery();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      setLoading(true);
      const pload = {
        ...data,
      };
      await setDoc(
        doc(db, "gallery", currGallery?.id ?? data.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Image info updated successfully");
      setVisible(false);
      await getAllGallery();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row>
        <Col style={{ textAlign: "right" }} span={24}>
          <Space>
            <Search
              placeholder="input search text"
              onSearch={(value: string) => setSearchTerm(value)}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              onClick={() => {
                setCurrGallery(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Gallery
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingGallery ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Gallery"
              columns={columns}
              data={filteredProducts}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <GalleryForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defaultImages={currGallery?.url}
        currImages={processedFiles}
        isNew={!currGallery?.id}
        galleryId={currGallery?.id ?? uuidv4()}
      />
    </>
  );
};

export default Gallery;
