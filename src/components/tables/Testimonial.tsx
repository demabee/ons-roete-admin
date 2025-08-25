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
import useTestimonials from '../../hooks/useTestimonials';
import { TestimonialType } from '../../types/Testimonial';
import { TestimonialForm } from '../forms/TestimonialForm';

const { Search } = Input;

const TestimonialTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currTestimonial, setCurrTestimonial] = useState<TestimonialType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [form] = useForm();
  const {
    data: testimonial,
    getAll: getAllTestimonial,
    create: createTestimonial,
    update: updateTestimonial,
    remove: deleteTestimonial,
    loading: loadingTestimonial
  } = useTestimonials();

  const filteredTestimonials = useMemo(() => {
    const tempGallery = testimonial;
    return !searchTerm
      ? tempGallery ?? []
      : (tempGallery ?? []).filter(
        (item: TestimonialType) => {
          const titleMatch = (item?.name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return titleMatch;
        }
      );
  }, [searchTerm, testimonial]);

  const columns: any[] = [
    {
      name: "Name",
      width: "20%",
      dataIndex: "name",
      sortable: true,
      key: "name",
      selector: (row: { name: string; }) =>
        row?.name || "-",
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
      cell: (row: any, record: TestimonialType) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            loading={loadingTestimonial}
            onClick={() => {
              setCurrTestimonial(row);
              showModal(row);
            }}
          >
            Edit
          </Button>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this testimonial?"
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
              loading={loadingTestimonial}
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
    getAllTestimonial();
  }, [getAllTestimonial]);

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

  const handleCreate = async (data: TestimonialType) => {
    try {
      setLoading(true);
      await createTestimonial({
        ...data,
        dateCreated: serverTimestamp(),
      })
      message.success("Testimonial created successfully");
      setVisible(false);
      await getAllTestimonial();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    try {
      setLoading(true);
      await deleteTestimonial(id);
      message.success("Testimonial deleted successfully");
      await getAllTestimonial();
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
      await updateTestimonial(currTestimonial?.id ?? data.id, pload);
      message.success("Testimonial updated successfully");
      setVisible(false);
      await getAllTestimonial();
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
                setCurrTestimonial(null);
                showModal();
              }}
              icon={<PlusOutlined />}
            >
              New Testimonial
            </Button>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingTestimonial ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Testimonials"
              columns={columns}
              data={filteredTestimonials}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <TestimonialForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        isNew={!currTestimonial?.id}
        testimonialId={currTestimonial?.id ?? uuidv4()}
      />
    </>
  );
};

export default TestimonialTable;
