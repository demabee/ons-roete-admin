import { useState, useEffect, useMemo } from "react";
import { Button, message, Row, Col, Spin, Space, Input, Divider } from "antd";
import DataTable from "react-data-table-component";
import {
  Timestamp,
  // deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
// import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
// import { getAuth } from 'firebase/auth';
import { useForm } from "antd/es/form/Form";
import { RequestForm } from "./Request/RequestForm";
import useGetRequests from "../hooks/requests/useGetRequests";
import { v4 as uuidv4 } from "uuid";
import { toSentenceCase } from "../helpers/common";
import { RequestView } from "./Request/ViewRequest";

const { Search } = Input;
interface Request {
  id: string;
  name: string;
  description?: string;
  subtitle?: string;
  category?: string;
  dateCreated?: Timestamp;
  url?: string;
}

// const auth = getAuth();

const Requests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currRequest, setCurrRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [form] = useForm();
  const {
    data: requests,
    fetchData: fetchRequests,
    loading: loadingRequests,
  } = useGetRequests();
  // const {
  //   data: featuredRequest,
  //   fetchData: fetchFeatured,
  //   loading: loadingFeatured,
  // } = useGetFeaturedRequest();
  // const {
  //   data: featuredRequest2,
  //   fetchData: fetchFeatured2,
  //   loading: loadingFeatured2,
  // } = useGetFeatured2Request();

  const filteredRequests = useMemo(() => {
    const tempRequests = requests;
    return !searchTerm
      ? tempRequests ?? []
      : (tempRequests ?? []).filter(
        (item: { fullName: string; description: string; email: string }) => {
          return (
            (item?.fullName || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item?.description || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (item?.email || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }
      );
  }, [searchTerm, requests]);
  const columns: any[] = [
    {
      name: "Full Name",
      dataIndex: "fullName",
      wrap: true,
      sortable: true,
      key: "fullName",
      selector: (row: { fullName: string }) => row?.fullName,
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
      name: "Email Address",
      dataIndex: "email",
      wrap: true,
      sortable: true,
      key: "email",
      selector: (row: { email: string }) => row?.email || "-",
    },
    {
      name: "Phone Number",
      dataIndex: "phoneNumber",
      sortable: true,
      key: "phoneNumber",
      selector: (row: { phoneNumber: string }) => row?.phoneNumber || "-",
    },
    {
      name: "Description",
      dataIndex: "description",
      wrap: true,
      sortable: true,
      key: "description",
      selector: (row: { description: string }) => row?.description || "-",
    },
    {
      name: "Status",
      dataIndex: "status",
      sortable: true,
      key: "status",
      selector: (row: { status: string }) =>
        toSentenceCase(row?.status || "pending"),
    },
    {
      name: "Date preferred",
      dataIndex: "dateTime",
      sortable: true,
      key: "dateTime",
      wrap: true,
      id: "dateTime",
      sortFunction: (rowA: any, rowB: any) => {
        const dateA = rowA?.dateTime ? dayjs(rowA.dateTime.toDate()) : null;
        const dateB = rowB?.dateTime ? dayjs(rowB.dateTime.toDate()) : null;

        if (!dateA) return -1; // Sort null or missing dates to the bottom
        if (!dateB) return 1;

        return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0; // Proper comparison
      },
      selector: (row: { dateTime: Timestamp }) =>
        row?.dateTime
          ? dayjs(row?.dateTime?.toDate()).format("YYYY-MM-DD hh:mm a")
          : dayjs().format("YYYY-MM-DD hh:mm a"),
    },
    {
      name: "Date created",
      dataIndex: "createdAt",
      sortable: true,
      wrap: true,
      key: "createdAt",
      id: "createdAt",
      sortFunction: (rowA: any, rowB: any) => {
        const dateA = rowA?.createdAt ? dayjs(rowA.createdAt.toDate()) : null;
        const dateB = rowB?.createdAt ? dayjs(rowB.createdAt.toDate()) : null;

        if (!dateA) return -1; // Sort null or missing dates to the bottom
        if (!dateB) return 1;

        return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0; // Proper comparison
      },
      selector: (row: { createdAt: Timestamp }) =>
        row?.createdAt
          ? dayjs(row?.createdAt?.toDate()).format("YYYY-MM-DD hh:mm a")
          : '-',
    },
    {
      name: "Actions",
      key: "action",
      cell: (row: any, record: Request) => (
        <>
          <Button
            size="small"
            loading={isLoading}
            style={{
              width: 130,
              fontSize: 12,
            }}
            type="default"
            onClick={async () => {
              setSelectedRequest(row)
            }}
          >
            View
          </Button>
          <Divider type="vertical" />

          <Button
            size="small"
            type={row?.status === "in progress" ? "primary" : "default"}
            style={{
              fontSize: 12,
            }}
            loading={isLoading}
            onClick={async () => {
              setIsLoading(true);
              setCurrRequest(row);
              // showModal(row);

              await setDoc(
                doc(db, "requests", row?.id),
                {
                  status:
                    row?.status === "in progress" ? "completed" : "in progress",
                },
                { merge: true }
              );
              await fetchRequests();
              setIsLoading(false);
            }}
          >
            Set as {row?.status === "in progress" ? "completed" : "in progress"}
          </Button>
          {/* <Divider type="vertical" />
          <Button
            size="small"
            disabled={row?.featured}
            loading={isLoading}
            style={{
              width: 130,
              fontSize: 12,
            }}
            type="dashed"
            onClick={async () => {
              setIsLoading(true);
              await setDoc(
                doc(db, "requests", row?.id),
                {
                  featured: true,
                },
                { merge: true }
              );
              featuredRequest?.id &&
                (await setDoc(
                  doc(db, "requests", featuredRequest?.id),
                  {
                    featured: false,
                  },
                  { merge: true }
                ));
              await fetchRequests();
              await fetchFeatured();
              setIsLoading(false);
            }}
          >
            {row?.featured ? "Featured" : "Set as Featured"}
          </Button> */}
          {/* <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this request?"
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
          </Popconfirm> */}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // useEffect(() => {
  //   fetchFeatured();
  // }, [fetchFeatured]);

  // useEffect(() => {
  //   fetchFeatured2();
  // }, [fetchFeatured2]);

  // const showModal = (request?: any) => {
  //   if (request) {
  //     const pload = {
  //       ...request,
  //     };
  //     form.setFieldsValue(pload);
  //   }
  //   setVisible(true);
  // };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCancelView = () => {
    setSelectedRequest(null);
  };

  const handleCreate = async (request: Request) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "requests", request.id), {
        ...request,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
      });
      message.success("Request created successfully");
      setVisible(false);
      // if (!auth?.currentUser) return;
      // await setDoc(doc(db, 'audit', uuidv4()), {
      //   email: auth.currentUser.email,
      //   user: doc(db, 'students', auth.currentUser.uid),
      //   type: `Update request ${request.title}`,
      //   userId: auth.currentUser.uid,
      //   userType: 'admins',
      //   timestamp: serverTimestamp(),
      // });
      await fetchRequests();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // const handleDelete = async (nodeId: any) => {
  //   try {
  //     setLoading(true);
  //     await deleteDoc(doc(db, "requests", nodeId));
  //     message.success("Request deleted successfully");
  //     await fetchRequests();
  //   } catch (error) {
  //     message.error((error as Error).message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdate = async (request: any) => {
    try {
      setLoading(true);
      const pload = {
        ...request,
      };
      await setDoc(
        doc(db, "requests", currRequest?.id ?? request.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Request updated successfully");
      setVisible(false);
      await fetchRequests();
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
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {loadingRequests ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="Requests"
              columns={columns}
              data={filteredRequests}
              progressPending={loading}
              defaultSortAsc={false}
              defaultSortFieldId="createdAt"
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <RequestForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        category={currRequest?.category ?? ""}
        defaultImage={currRequest?.url ?? ""}
        isNew={!currRequest?.id}
        nodeId={currRequest?.id ?? uuidv4()}
      />
      <RequestView
        visible={!!selectedRequest}
        onCancel={handleCancelView}
        request={selectedRequest}
      />
    </>
  );
};

export default Requests;
