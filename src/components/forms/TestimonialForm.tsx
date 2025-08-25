import { useState } from "react";
import {
  Modal,
  Form,
  Input,
} from "antd";

interface TestimonialFormProps {
  form: any;
  isNew: boolean;
  visible: boolean;
  onCreate: any;
  onUpdate: (values: Event) => void;
  onCancel: () => void;
  testimonialId?: string;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  form,
  isNew,
  visible,
  onCreate,
  onUpdate,
  onCancel,
  testimonialId
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Modal
      open={visible}
      title={!isNew ? "Update image info" : "Upload new image info"}
      okText={!isNew ? "Update" : "Create"}
      confirmLoading={loading}
      okButtonProps={{ disabled: loading }}
      cancelText="Cancel"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => {
        form.validateFields().then(async (values: any) => {
          setLoading(true);
          const process = !isNew ? onUpdate : onCreate;
          const payload = {
            ...values,
            id: testimonialId
          };
          await process(payload);
          form.resetFields();
          setLoading(false);
        }).catch(() => setLoading(false));
      }}
    >
      <Form form={form} initialValues={{ name: "", description: "" }} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter Name" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description" rules={[{ required: true, message: "Please enter Description" }]}>
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
