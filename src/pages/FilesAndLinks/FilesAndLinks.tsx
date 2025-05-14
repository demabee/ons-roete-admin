import { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Typography, message, Col, Row, Spin, Button, Input } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Dragger from "antd/es/upload/Dragger";
import { UploadFile } from "antd/lib/upload/interface";
import { db, storage } from "../../firebase/config";
import { useGetAllEguides } from "../../hooks/users/useGetEguides";

const { Title } = Typography;

const FilesAndLinks: React.FC = () => {
  const [headerText, setHeaderText] = useState<any>("");
  const [headerText2, setHeaderText2] = useState<any>("");
  const [headerText3, setHeaderText3] = useState<any>("");
  const [headerUrl, setHeaderUrl] = useState<any>("");
  const [headerUrl2, setHeaderUrl2] = useState<any>("");
  const [headerUrl3, setHeaderUrl3] = useState<any>("");
  const [isLoading, setLoading] = useState<boolean>(false);

  const [fileList1, setFileList1] = useState<UploadFile[]>([]);
  const [fileList2, setFileList2] = useState<UploadFile[]>([]);
  const [fileList3, setFileList3] = useState<UploadFile[]>([]);
  const [nodeImage, setProductImage] = useState<UploadFile[]>([]);
  const { data, fetchData, loading } = useGetAllEguides();

  useEffect(() => {
    fetchData();

    const fetchHeaderText = async () => {
      const headerTextDocRef = doc(db, "settings", "headerText");
      const headerTextDocSnap = await getDoc(headerTextDocRef);

      if (headerTextDocSnap.exists()) {
        const headerTextData = headerTextDocSnap.data();
        if (headerTextData) {
          setHeaderText(headerTextData?.body);
          setHeaderUrl(headerTextData?.url);
        }
      }
    };

    fetchHeaderText();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const fetchHeaderText = async () => {
      const headerTextDocRef = doc(db, "settings", "headerText2");
      const headerTextDocSnap = await getDoc(headerTextDocRef);

      if (headerTextDocSnap.exists()) {
        const headerTextData = headerTextDocSnap.data();
        if (headerTextData) {
          setHeaderText2(headerTextData?.body);
          setHeaderUrl2(headerTextData?.url);
        }
      }
    };

    fetchHeaderText();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const fetchHeaderText = async () => {
      const headerTextDocRef = doc(db, "settings", "headerText3");
      const headerTextDocSnap = await getDoc(headerTextDocRef);

      if (headerTextDocSnap.exists()) {
        const headerTextData = headerTextDocSnap.data();
        if (headerTextData) {
          setHeaderText3(headerTextData?.body);
          setHeaderUrl3(headerTextData?.url);
        }
      }
    };

    fetchHeaderText();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (data && data.length > 0) {
      setFileList1([data.find((d: { id: string }) => d.id === "header-1")]);
      setFileList2([data.find((d: { id: string }) => d.id === "header-2")]);
      setFileList3([data.find((d: { id: string }) => d.id === "header-3")]);
      setProductImage([data.find((d: { id: string }) => d.id === "node")]);
    }
  }, [data]);

  const handleUpload = async (
    fileList: UploadFile[],
    setFileList: (fileList: UploadFile[]) => void,
    event: any,
    id: string
  ) => {
    const file = event.file;
    const storageRef = ref(storage, `/headers/${Date.now()}-${file?.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setFileList([event.file]);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(
          `Upload is ${progress.toFixed(2)}% done (${
            snapshot.bytesTransferred
          }/${snapshot.totalBytes} bytes transferred)`
        );
      },
      (error) => {
        message.error(`${event?.file?.name} file upload failed.`);
      },
      async () => {
        const downloadURL = await getDownloadURL(storageRef);
        const data = {
          id: id,
          name: file?.name,
          url: downloadURL,
        };
        await setDoc(doc(db, "files", id), data);
        message.success(`${event?.file?.name} file uploaded successfully`);
      }
    );
  };

  const uploadProps1 = {
    name: "header-1",
    multiple: false,
    fileList: fileList1 ?? [],
    showUploadList: false,
    customRequest: (options: any) =>
      handleUpload(fileList1 ?? [], setFileList1, options, "header-1"),
  };

  const uploadProps2 = {
    name: "header-2",
    multiple: false,
    fileList: fileList2 ?? [],
    showUploadList: false,
    customRequest: (options: any) =>
      handleUpload(fileList2 ?? [], setFileList2, options, "header-2"),
  };

  const uploadProps3 = {
    name: "header-3",
    multiple: false,
    fileList: fileList3 ?? [],
    showUploadList: false,
    customRequest: (options: any) =>
      handleUpload(fileList3 ?? [], setFileList3, options, "header-3"),
  };

  const uploadProps4 = {
    name: "node",
    multiple: false,
    fileList: nodeImage ?? [],
    showUploadList: false,
    customRequest: (options: any) =>
      handleUpload(nodeImage ?? [], setProductImage, options, "node"),
  };

  const handleHeaderTextUpdate = async () => {
    try {
      setLoading(true);
      if (headerText) {
        const headerTextData = {
          body: headerText,
          url: headerUrl || "",
        };

        await setDoc(doc(db, "settings", "headerText"), headerTextData);
      }
      if (headerText2) {
        const headerTextData = {
          body: headerText2,
          url: headerUrl2 || "",
        };

        await setDoc(doc(db, "settings", "headerText2"), headerTextData);
      }
      if (headerText3) {
        const headerTextData = {
          body: headerText3,
          url: headerUrl3 || "",
        };

        await setDoc(doc(db, "settings", "headerText3"), headerTextData);
      }
      message.success("Successfully updated Header Text!");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      <Title level={3}>Header Text</Title>
      <Row>
        <Col
          span={24}
          style={{ display: "flex", flexDirection: "column", paddingTop: 15 }}
        >
          <h3>Header 1</h3>
          <label>Text</label>
          <Input
            name="headerText"
            value={headerText}
            onChange={(time) => {
              setHeaderText(time?.target?.value);
            }}
          />
          <br />
          <label>URL</label>
          <Input
            aria-label="URL"
            name="headerUrl"
            placeholder="URL"
            value={headerUrl}
            onChange={(time) => {
              setHeaderUrl(time?.target?.value);
            }}
          />
        </Col>
        <Col
          span={24}
          style={{ display: "flex", flexDirection: "column", paddingTop: 15 }}
        >
          <h3>Header 2</h3>
          <label>Text</label>
          <Input
            name="headerText2"
            value={headerText2}
            onChange={(time) => {
              setHeaderText2(time?.target?.value);
            }}
          />
          <br />
          <label>URL</label>
          <Input
            aria-label="URL"
            name="headerUrl2"
            placeholder="URL"
            value={headerUrl2}
            onChange={(time) => {
              setHeaderUrl2(time?.target?.value);
            }}
          />
        </Col>
        <Col
          span={24}
          style={{ display: "flex", flexDirection: "column", paddingTop: 15 }}
        >
          <h3>Header 3</h3>
          <label>Text</label>
          <Input
            name="headerText3"
            value={headerText3}
            onChange={(time) => {
              setHeaderText3(time?.target?.value);
            }}
          />
          <br />
          <label>URL</label>
          <Input
            aria-label="URL"
            name="headerUrl3"
            placeholder="URL"
            value={headerUrl3}
            onChange={(time) => {
              setHeaderUrl3(time?.target?.value);
            }}
          />
        </Col>
        <Col span={24}>
          <br />
          <Button loading={isLoading} onClick={handleHeaderTextUpdate}>
            Update Header Text
          </Button>
        </Col>
      </Row>
      <br />
      <Title level={3}>Upload Images</Title>
      <br />
      <Row gutter={24}>
        <Col span={6}>
          <h3>Node Image</h3>
          <Dragger style={{ height: "inherit" }} {...uploadProps4}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single file upload only.
            </p>
          </Dragger>
          {(nodeImage ?? []).length > 0 && (
            <a
              style={{ marginTop: 10 }}
              target="_blank"
              rel="noopener noreferrer"
              href={nodeImage[0]?.url}
            >
              {nodeImage[0]?.name}
            </a>
          )}
        </Col>
        <Col span={6}>
          <h3>Header Image 1</h3>
          <Dragger style={{ height: "inherit" }} {...uploadProps1}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single file upload only.
            </p>
          </Dragger>
          {(fileList1 ?? []).length > 0 && (
            <a
              style={{ marginTop: 10 }}
              target="_blank"
              rel="noopener noreferrer"
              href={fileList1[0]?.url}
            >
              {fileList1[0]?.name}
            </a>
          )}
        </Col>
        <Col span={6}>
          <h3>Header Image 2</h3>
          <Dragger style={{ height: "inherit" }} {...uploadProps2}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single file upload only.
            </p>
          </Dragger>
          {fileList2.length > 0 && (
            <a
              style={{ marginTop: 10 }}
              target="_blank"
              rel="noopener noreferrer"
              href={fileList2[0]?.url}
            >
              {fileList2[0]?.name}
            </a>
          )}
        </Col>
        <Col span={6}>
          <h3>Header Image 3</h3>
          <Dragger style={{ height: "inherit" }} {...uploadProps3}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single file upload only.
            </p>
          </Dragger>
          {fileList3.length > 0 && (
            <a
              style={{ marginTop: 10 }}
              target="_blank"
              rel="noopener noreferrer"
              href={fileList3[0]?.url}
            >
              {fileList3[0]?.name}
            </a>
          )}
        </Col>
      </Row>
      <Row style={{ paddingBottom: 50 }}></Row>
    </div>
  );
};

export default FilesAndLinks;
