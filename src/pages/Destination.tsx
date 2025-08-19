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
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import { v4 as uuidv4 } from "uuid";
import { DestinationForm } from '../components/forms/DestinationForm';
import useDestination from '../hooks/useDestination';
import { DestinationType } from '../types/Destination';

const { Search } = Input;

const Destination: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currDestination, setCurrDestination] = useState<DestinationType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [form] = useForm();
  const {
    data: destination,
    getAll: getAllDestination,
    loading: loadingDestination
  } = useDestination();

  const filteredDestination = useMemo(() => {
    const tempGallery = destination;
    return !searchTerm
      ? tempGallery ?? []
      : (tempGallery ?? []).filter(
        (item: DestinationType) => {
          const titleMatch = (item?.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const descriptionMatch = typeof item?.description === "string"
            ? item.description.toLowerCase().includes(searchTerm.toLowerCase())
            : false;
          return titleMatch || descriptionMatch;
        }
      );
  }, [searchTerm, destination]);

  const columns: any[] = [
    {
      name: "Image",
      selector: (row: DestinationType) =>
        row?.thumb ? <Avatar src={row.thumb} size={40} shape="square" /> : "-",
      sortable: false,
      width: "80px",
    },
    {
      name: "Title",
      selector: (row: DestinationType) => row?.title || "-",
      sortable: true,
      grow: 1,
    },
    {
      name: "Date Created",
      selector: (row: DestinationType) =>
        row?.dateCreated
          ? dayjs(row.dateCreated.toDate()).format("YYYY-MM-DD hh:mm a")
          : "-",
      sortable: true,
      grow: 1,
    },
    {
      name: "Actions",
      cell: (row: DestinationType) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={() => {
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
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];
  ;

  useEffect(() => {
    getAllDestination();
  }, [getAllDestination]);

  useEffect(() => {
    if (currDestination?.images) {
      setProcessedFiles(currDestination?.images);
    }
  }, [currDestination?.images]);

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

  const handleCreate = async (data: DestinationType) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "destination", data.id), {
        ...data,
        dateCreated: serverTimestamp(),
      });
      message.success("Image info created successfully");
      setVisible(false);
      await getAllDestination();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nodeId: any) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "destination", nodeId));
      message.success("Destination deleted successfully");
      await getAllDestination();
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
        doc(db, "destination", currDestination?.id ?? data.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Image info updated successfully");
      setVisible(false);
      await getAllDestination();
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
                setCurrDestination(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Destination
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingDestination ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Destination"
              columns={columns}
              data={filteredDestination}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <DestinationForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defaultImages={currDestination?.url}
        currImages={processedFiles}
        isNew={!currDestination?.id}
        destinationId={currDestination?.id ?? uuidv4()}
      />
    </>
  );
};

export default Destination;
