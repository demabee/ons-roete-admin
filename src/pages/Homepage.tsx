import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Upload,
  message,
  Spin
} from "antd";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import InterestTable from '../components/tables/Interest';
import TestimonialTable from '../components/tables/Testimonial';
import Gallery from './Gallery';
import { UploadOutlined } from '@ant-design/icons';
import useHero from '../hooks/useHero';
import { storage } from '../firebase/config';

const { TextArea } = Input;

const Homepage = () => {
  const [form] = Form.useForm();
  const { data, getHero, createOrUpdate, loading } = useHero();
  const [uploading, setUploading] = useState(false);

  const handleSave = async (values: any) => {
    console.log("Form Values:", values);
    try {
      let videoUrl = data?.videoUrl || "";

      if (values.videoUrl && values.videoUrl.length > 0) {
        setUploading(true);
        const file = values.videoUrl[0].originFileObj;
        const storageRef = ref(storage, `videos/${file.name}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        videoUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        videoUrl,
        heroTitle: values.heroTitle,
        heroDescription: values.heroDescription,
        quote: values.quote,
      };
      console.log("Payload:", payload);

      await createOrUpdate(data?.id || null, payload);
      message.success("Hero section saved successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to save hero section");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const heroData = await getHero();
      if (heroData) {
        form.setFieldsValue({
          heroTitle: heroData.heroTitle || "",
          heroDescription: heroData.heroDescription || "",
          quote: heroData.quote || "",
        });
      }
    };
    fetchData();
  }, [getHero, form]);

  if (loading) {
    return <Spin />
  }

  return (
    <>
      <Form layout="vertical" onFinish={handleSave} form={form}>
        <Row>
          <Col span={24}>
            <Card title="Hero Section" style={{ marginBottom: 24 }}>
              <Form.Item
                label="Hero Video"
                name="videoUrl"
              // valuePropName="fileList"
              // getValueFromEvent={(e) => {
              //   if (Array.isArray(e)) {
              //     return e;
              //   }
              //   return e?.fileList;
              // }}
              >
                {data?.videoUrl && (
                  <video
                    src={data?.videoUrl}
                    controls
                    style={{ marginTop: 16, width: "100%", borderRadius: 8 }}
                  />
                )}
                <Upload
                  accept="video/mp4,video/mov,video/avi"
                  beforeUpload={() => false} // Prevent automatic upload
                  maxCount={1}
                  listType="text"
                >
                  <Button icon={<UploadOutlined />}>Upload Video</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="Title" name="heroTitle" initialValue="Zuid-Afrika">
                <Input />
              </Form.Item>
              <Form.Item label="Subtitle" name="heroSubtitle" initialValue="">
                <Input />
              </Form.Item>
              <Form.Item
                label="Description"
                name="heroDescription"
                initialValue="Vind jouw volgende bestemming op gevoel en interesse"
              >
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item label="Description Highlight" name="descriptionHighlight" initialValue="">
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item
                label="Quote"
                name="quote"
                initialValue="Het gaat niet om de roete die je volgt, maar om de verhalen die je onderweg hoort."
              >
                <TextArea rows={3} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" block loading={uploading}>
                  Save Changes
                </Button>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      <Row gutter={23}>
        <Col span={12}>
          <Card title="Interests" style={{ marginBottom: 24 }}>
            <InterestTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Testimonials" style={{ marginBottom: 24 }}>
            <TestimonialTable />
          </Card>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Card title="Gallery" style={{ marginBottom: 24 }}>
            <Gallery />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Homepage;
