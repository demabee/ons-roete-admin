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
  serverTimestamp,
} from "firebase/firestore";
import dayjs from "dayjs";
import { useForm } from "antd/es/form/Form";
import { v4 as uuidv4 } from "uuid";
import { InterestType } from '../../types/Interest';
import useInterest from '../../hooks/useInterest';
import { InterestForm } from '../forms/InterestForm';

const { Search } = Input;

const InterestTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currInterest, setCurrInterest] = useState<InterestType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [processedFile, setProcessedFile] = useState<string>('');
  const [form] = useForm();
  const {
    data: interest,
    getAll: getAllInterest,
    create: createInterest,
    update: updateInterest,
    remove: deleteInterest,
    loading: loadingInterest
  } = useInterest();

  const filteredProducts = useMemo(() => {
    const tempGallery = interest;
    return !searchTerm
      ? tempGallery ?? []
      : (tempGallery ?? []).filter(
        (item: InterestType) => {
          const titleMatch = (item?.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return titleMatch;
        }
      );
  }, [searchTerm, interest]);

  const columns: any[] = [
    {
      name: "Image",
      dataIndex: "imageUrl",
      sortable: true,
      key: "imageUrl",
      selector: (row: { imageUrl: string; thumb?: string }) =>
        row?.imageUrl ? <Avatar src={row?.imageUrl} size={40} shape="square" /> : "-",
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
      cell: (row: any, record: InterestType) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={loadingInterest}
            onClick={() => {
              setCurrInterest(row);
              showModal(row);
            }}
          >
            Edit
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this interest?"
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
              loading={loadingInterest}
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
    getAllInterest();
  }, [getAllInterest]);

  useEffect(() => {
    if (currInterest?.imageUrl) {
      setProcessedFile(currInterest?.imageUrl);
    }
  }, [currInterest?.imageUrl]);

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

  const handleCreate = async (data: InterestType) => {
    try {
      setLoading(true);
      await createInterest({
        ...data,
        dateCreated: serverTimestamp(),
      })
      message.success("Interest created successfully");
      setVisible(false);
      await getAllInterest();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    try {
      setLoading(true);
      await deleteInterest(id);
      message.success("Interest deleted successfully");
      await getAllInterest();
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
      await updateInterest(currInterest?.id ?? data.id, pload);
      message.success("Interest updated successfully");
      setVisible(false);
      await getAllInterest();
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
                setCurrInterest(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Interest
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingInterest ? (
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
      <InterestForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defaultImages={currInterest?.imageUrl}
        currImage={processedFile}
        isNew={!currInterest?.id}
        interestId={currInterest?.id ?? uuidv4()}
      />
    </>
  );
};

export default InterestTable;
