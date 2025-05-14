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
import dayjs from "dayjs";
import DataTable from "react-data-table-component";
import {
  Timestamp,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useForm } from "antd/es/form/Form";
import { CategoryForm } from "./Category/CategoryForm";
import useGetCategories from "../hooks/categories/useGetCategories";
import { v4 as uuidv4 } from "uuid";
import { PlusOutlined } from "@ant-design/icons";
import { CategoryView } from "./Category/CategoryView";

const { Search } = Input;
interface Category {
  id: string;
  name: string;
  code?: string;
  dateCreated?: Timestamp;
  url?: string;
  isView?: boolean;
}

// const auth = getAuth();

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currCategory, setCurrCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [form] = useForm();
  const {
    data: categories,
    fetchData: fetchCategories,
    loading: loadingCategories,
  } = useGetCategories();

  const filteredCategories = useMemo(() => {
    const tempCategories = categories;
    return !searchTerm
      ? tempCategories ?? []
      : (tempCategories ?? []).filter(
          (item: { title: string; subtitle: string; author: string }) => {
            return (
              (item?.title || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item?.subtitle || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item?.author || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
          }
        );
  }, [searchTerm, categories]);
  const columns: any[] = [
    {
      name: "Image",
      dataIndex: "url",
      sortable: true,
      key: "url",
      selector: (row: { url: string; thumb?: string }) =>
        row?.url ?? row?.thumb ? (
          <Avatar src={row?.url ?? row?.thumb} size={40} shape="square" />
        ) : (
          "-"
        ),
    },
    {
      name: "Name",
      width: "20%",
      dataIndex: "name",
      sortable: true,
      key: "name",
      selector: (row: { name: string; technicalDescription: string }) =>
        row?.name ?? (row?.technicalDescription || "-"),
    },
    // {
    //   name: "Subtitle",
    //   width: "30%",
    //   dataIndex: "subtitle",
    //   sortable: true,
    //   key: "subtitle",
    //   selector: (row: { subtitle: string; bANQADescriptionENG: string }) =>
    //     row?.subtitle ?? (row?.bANQADescriptionENG || "-"),
    // },
    {
      name: "Code",
      dataIndex: "code",
      sortable: true,
      key: "code",
      selector: (row: { code: string }) => row?.code ?? "-",
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
      width: "35%",
      key: "action",
      cell: (row: any, record: Category) => (
        <>
          <Button
            size="small"
            type="default"
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={() => {
              setCurrCategory({ ...row, isView: true });
              showModal(row);
            }}
          >
            View
          </Button>
          <Divider type="vertical" />
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={() => {
              setCurrCategory(row);
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
                doc(db, "categories", row?.id),
                {
                  hideFromList: !row?.hideFromList,
                },
                { merge: true }
              );
              await fetchCategories();
              setIsLoading(false);
            }}
          >
            {row?.hideFromList ? "Set as Active" : "Set as Inactive"}
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this category?"
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
          <Divider type="vertical" />
          <Button
            type="default"
            size="small"
            loading={isLoading}
            style={{
              width: 130,
              backgroundColor: !row?.featured ? "white" : "gray",
              color: !row?.featured ? "#001529" : "white",
              fontSize: 12,
            }}
            onClick={async () => {
              setIsLoading(true);
              await setDoc(
                doc(db, "categories", row?.id),
                {
                  featured: !row?.featured,
                },
                { merge: true }
              );
              await fetchCategories();
              setIsLoading(false);
            }}
          >
            {!row?.featured ? "Set as Featured" : "Remove as Featured"}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const showModal = (category?: any) => {
    if (category) {
      const pload = {
        ...category,
      };
      form.setFieldsValue(pload);
    }
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = async (category: Category) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "categories", category.id), {
        ...category,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
      });
      message.success("Category created successfully");
      setVisible(false);
      await fetchCategories();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nodeId: any) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "categories", nodeId));
      message.success("Category deleted successfully");
      await fetchCategories();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (category: any) => {
    try {
      setLoading(true);
      const pload = {
        ...category,
      };
      await setDoc(
        doc(db, "categories", currCategory?.id ?? category.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Category updated successfully");
      setVisible(false);
      await fetchCategories();
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
                setCurrCategory(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Category
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingCategories ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Categories"
              columns={columns}
              data={filteredCategories}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      {currCategory && currCategory?.isView ? (
        <CategoryView
          visible={visible}
          onCancel={handleCancel}
          category={currCategory}
        />
      ) : (
        <CategoryForm
          form={form}
          visible={visible}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
          defaultImage={currCategory?.url ?? ""}
          isNew={!currCategory?.id}
          categoryId={currCategory?.id ?? uuidv4()}
        />
      )}
    </>
  );
};

export default Categories;
