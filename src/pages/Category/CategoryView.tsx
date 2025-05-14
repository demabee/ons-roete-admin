import {
  Modal,
  Button,
  Space,
  Form,
  Input,
  Spin,
  Popconfirm,
  message,
  Table,
} from "antd";
import { useForm } from "antd/es/form/Form";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { useGetSubCategories } from "../../hooks/categories/useGetCategories";

interface EventFormProps {
  visible: boolean;
  onCancel: () => void;
  category: any;
}

export const CategoryView: React.FC<EventFormProps> = ({
  visible,
  onCancel,
  category,
}) => {
  const [form] = useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    data: subcategories,
    fetchData: fetchSubCategories,
    loading: loadingCategories,
  } = useGetSubCategories();

  const onFinish = async (values: any) => {
    setIsLoading(true);
    try {
      const categoryDocRef = doc(db, "categories", category?.id);
      const subcategoriesCollectionRef = collection(
        categoryDocRef,
        "subcategories"
      );

      const res = await addDoc(subcategoriesCollectionRef, {
        ...values,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
      });

      await setDoc(doc(db, "subcategories", res.id), {
        ...values,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
        parentCode: category?.code || "-",
      });
      form.resetFields();
      await fetchSubCategories(category?.id);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: { id: any; }) => (
        <Space>
          <Popconfirm
            title="Are you sure to delete this subcategory?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" type="default" loading={isLoading} style={{ backgroundColor: "#d2020a", color: '#fff' }}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const handleDelete = async (subCatId: any) => {
    try {
      setIsLoading(true);
      const subcategoryDocRef = doc(
        db,
        "categories",
        category?.id,
        "subcategories",
        subCatId
      );
      const scategoryDocRef = doc(db, "subcategories", subCatId);
      await deleteDoc(subcategoryDocRef);
      await deleteDoc(scategoryDocRef);
      message.success("Subcategory deleted successfully");
      await fetchSubCategories(category?.id);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (category?.id) fetchSubCategories(category?.id);
  }, [category?.id, fetchSubCategories]); // Assuming category is a dependency that triggers the fetch

  useEffect(() => {
  }, [subcategories]); // Assuming category is a dependency that triggers the fetch

  return (
    <Modal
      open={visible}
      title="Category Details"
      footer={null}
      onCancel={onCancel}
      width="80vh"
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
        {category?.url && (
          <img src={category?.url} alt="category" style={{ width: "80px" }} />
        )}
      </div>
      <h4>Details</h4>
      <table width={"100%"}>
        <tr>
          <td>Category Name</td>
          <td>{category?.name || "-"}</td>
        </tr>
        <tr>
          <td>Category Code</td>
          <td>{category?.code || "-"}</td>
        </tr>
      </table>
      <br />
      <Space align="center">
        <h4>Sub Categories</h4>
      </Space>
      {loadingCategories ? (
        <Spin />
      ) : (

        <Table
          dataSource={subcategories}
          size='small'
          columns={columns}
          bordered
          style={{ borderColor: "gray" }}
          locale={{
            emptyText: "No Subcategories",
          }}
          rowKey={(record) => record.id}
        />
      )}
      <br />
      <Form form={form} onFinish={onFinish} layout="horizontal">
        <Form.Item
          name="name"
          label="Name (EN)"
          rules={[{ required: true, message: "Please enter subcategory name" }]}
          style={{ display: "inline-block", width: "calc(33% - 8px)" }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="nameEs"
          label="Name (ES)"
          rules={[{ required: true, message: "Please enter subcategory name (ES)" }]}
          style={{ display: "inline-block", width: "calc(33% - 8px)" }}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="code"
          label="Code"
          rules={[{ required: true, message: "Please enter subcategory code" }]}
          style={{
            display: "inline-block",
            width: "calc(24% - 8px)",
            margin: "0 8px",
          }}
        >
          <Input />
        </Form.Item>
        <Button
          loading={isLoading}
          style={{
            width: "calc(10% - 8px)",
          }}
          type="primary"
          htmlType="submit"
        >
          +
        </Button>
      </Form>
    </Modal>
  );
};
