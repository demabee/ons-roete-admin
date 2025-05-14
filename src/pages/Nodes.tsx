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
// import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
// import { getAuth } from 'firebase/auth';
import { useForm } from "antd/es/form/Form";
import { ProductForm } from "./Node/ProductForm";
import useGetProducts from "../hooks/nodes/useGetProducts";
import { v4 as uuidv4 } from "uuid";

const { Search } = Input;
interface Node {
  id: string;
  name: string;
  description?: string;
  subtitle?: string;
  dateCreated?: Timestamp;
  thumb?: string;
  images?: string[];
  medium?: string;
  highres?: string;
}

// const auth = getAuth();

const Nodes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currProduct, setCurrProduct] = useState<Node | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [form] = useForm();
  const {
    data: nodes,
    fetchData: fetchProducts,
    loading: loadingProducts,
  } = useGetProducts();

  const filteredProducts = useMemo(() => {
    const tempProducts = nodes;
    return !searchTerm
      ? tempProducts ?? []
      : (tempProducts ?? []).filter(
          (item: {
            technicalDescription: string;
            itemCategory: any[];
            author: string;
          }) => {
            return (
              (item?.technicalDescription || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item?.itemCategory || []).some(
                (i) =>
                  i.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.toLowerCase() === searchTerm.toLowerCase()
              )
            );
          }
        );
  }, [searchTerm, nodes]);
  const columns: any[] = [
    {
      name: "Image",
      dataIndex: "url",
      sortable: true,
      key: "url",
      selector: (row: { url: string; thumb?: string }) =>
        row?.thumb ? <Avatar src={row?.thumb} size={40} shape="square" /> : "-",
    },
    {
      name: "Title",
      width: "20%",
      dataIndex: "name",
      sortable: true,
      key: "name",
      selector: (row: { name: string; }) =>
        row?.name || "-",
    },
    {
      name: "Subtitle",
      width: "20%",
      dataIndex: "subtitle",
      sortable: true,
      key: "subtitle",
      selector: (row: { subtitle: string; }) =>
        row?.subtitle || "-",
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
      cell: (row: any, record: Node) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={() => {
              setCurrProduct(row);
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
              await fetchProducts();
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
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (currProduct?.images) {
      setProcessedFiles(currProduct?.images);
    }
  }, [currProduct?.images]);

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

  const handleCreate = async (node: Node) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "nodes", node.id), {
        ...node,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
      });
      message.success("Node created successfully");
      setVisible(false);
      // if (!auth?.currentUser) return;
      // await setDoc(doc(db, 'audit', uuidv4()), {
      //   email: auth.currentUser.email,
      //   user: doc(db, 'students', auth.currentUser.uid),
      //   type: `Update node ${node.title}`,
      //   userId: auth.currentUser.uid,
      //   userType: 'admins',
      //   timestamp: serverTimestamp(),
      // });
      await fetchProducts();
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
      await fetchProducts();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (node: any) => {
    try {
      setLoading(true);
      const pload = {
        ...node,
      };
      await setDoc(
        doc(db, "nodes", currProduct?.id ?? node.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Node updated successfully");
      setVisible(false);
      await fetchProducts();
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
                setCurrProduct(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Node
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingProducts ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Nodes"
              columns={columns}
              data={filteredProducts}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <ProductForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defaultImages={[
          currProduct?.thumb ?? "",
          currProduct?.medium ?? "",
          currProduct?.highres ?? "",
        ]}
        currImages={processedFiles}
        isNew={!currProduct?.id}
        nodeId={currProduct?.id ?? uuidv4()}
      />
    </>
  );
};

export default Nodes;
