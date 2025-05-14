import { useState, useEffect, useMemo } from "react";
import {
  Button,
  message,
  Row,
  Col,
  Spin,
  Space,
  Input,
  Avatar,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import DataTable from "react-data-table-component";
import {
  Timestamp,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
// import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
// import { getAuth } from 'firebase/auth';
import { useForm } from "antd/es/form/Form";
import { ProjectForm } from "./Project/ProjectForm";
import useGetProjects from "../hooks/projects/useGetProjects";

const { Search } = Input;
interface Map {
  id: string;
  name: string;
  description?: string;
  nodes: string[];
  coordinates: any[];
  subtitle?: string;
  dateCreated?: Timestamp;
  images?: string[];
  url?: string;
}

// const auth = getAuth();

const Maps: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currProject, setCurrProject] = useState<Map | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);
  const [form] = useForm();
  const {
    data: maps,
    fetchData: fetchProjects,
    loading: loadingProjects,
  } = useGetProjects();
  // const {
  //   data: featuredProject,
  //   fetchData: fetchFeatured,
  //   loading: loadingFeatured,
  // } = useGetFeaturedProject();
  // const {
  //   data: featuredProject2,
  //   fetchData: fetchFeatured2,
  //   loading: loadingFeatured2,
  // } = useGetFeatured2Project();

  const filteredProjects = useMemo(() => {
    const tempProjects = maps;
    return !searchTerm
      ? tempProjects ?? []
      : (tempProjects ?? []).filter(
          (item: {
            name: string;
            description: string;
            technicalDescription: string;
            subtitle: string;
          }) => {
            return (
              (item?.name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item?.description || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              (item?.subtitle || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
          }
        );
  }, [searchTerm, maps]);

  useEffect(() => {
    if (currProject?.images) {
      setProcessedFiles(currProject?.images);
    }
  }, [currProject?.images]);


  const columns: any[] = [
    {
      name: "Image",
      dataIndex: "url",
      sortable: true,
      key: "url",
      selector: (row: { url: string }) =>
        row?.url ? <Avatar src={row?.url} size={30} shape="square" /> : "-",
    },
    {
      name: "Map Name",
      dataIndex: "name",
      width: "20%",
      sortable: true,
      key: "name",
      selector: (row: { name: string }) => row?.name || "-",
    },
    {
      name: "# of Nodes",
      dataIndex: "nodes",
      sortable: true,
      key: "nodes",
      selector: (row: { nodes: string }) =>
        (row?.nodes ?? []).length || "-",
    },
    {
      name: "Date created",
      dataIndex: "dateCreated",
      sortable: true,
      key: "dateCreated",
      selector: (row: { dateCreated: Timestamp }) =>
        row?.dateCreated
          ? dayjs(row?.dateCreated?.toDate()).format("YYYY-MM-DD HH:mm:ss")
          : dayjs().format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      name: "Actions",
      width: "25%",
      key: "action",
      cell: (row: any, record: Map) => (
        <>
          <Button
            size="small"
            type="primary"
            style={{
              fontSize: 12,
            }}
            onClick={() => {
              setCurrProject(row);
              showModal(row);
            }}
          >
            Edit
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // useEffect(() => {
  //   fetchFeatured();
  // }, [fetchFeatured]);

  // useEffect(() => {
  //   fetchFeatured2();
  // }, [fetchFeatured2]);

  const showModal = (Map?: any) => {
    if (Map) {
      const pload = {
        ...Map,
      };
      form.setFieldsValue(pload);
    }
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleCreate = async (Map: Map) => {
    try {
      setLoading(true);
      await setDoc(doc(db, "maps", Map.id), {
        ...Map,
        hideFromList: false,
        featured: false,
        dateCreated: serverTimestamp(),
      });
      message.success("Map created successfully");
      setVisible(false);
      // if (!auth?.currentUser) return;
      // await setDoc(doc(db, 'audit', uuidv4()), {
      //   email: auth.currentUser.email,
      //   user: doc(db, 'students', auth.currentUser.uid),
      //   type: `Update Map ${Map.title}`,
      //   userId: auth.currentUser.uid,
      //   userType: 'admins',
      //   timestamp: serverTimestamp(),
      // });
      await fetchProjects();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (Map: any) => {
    try {
      setLoading(true);
      const pload = {
        ...Map,
      };
      await setDoc(
        doc(db, "maps", currProject?.id ?? Map.id),
        {
          ...pload,
        },
        { merge: true }
      );
      message.success("Map updated successfully");
      setVisible(false);
      await fetchProjects();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  console.log(currProject);

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
          {loadingProjects ? (
            <Spin size="large" className="spinner" />
          ) : (
            <DataTable
              title="maps"
              columns={columns}
              data={filteredProjects}
              progressPending={loading}
              noHeader
              pagination
            />
          )}
        </Col>
      </Row>
      <ProjectForm
        form={form}
        visible={visible}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        defCircles={currProject?.coordinates ?? []}
        nodes={currProject?.nodes ?? []}
        defaultImage={currProject?.url}
        currImages={processedFiles}
        isNew={!currProject?.id}
        projectId={currProject?.id ?? uuidv4()}
      />
    </>
  );
};

export default Maps;
