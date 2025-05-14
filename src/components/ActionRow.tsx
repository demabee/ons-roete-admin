import { Button, Popconfirm, Space, Tooltip } from 'antd';
import { AiOutlineCheck, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';

function ActionRow({
  row,
  edit,
  actions = {
    edit: true,
    delete: true,
    view: true,
    mark: true
  },
}: any) {
  return (
    <Space>
      {actions.edit && (
        <Tooltip title='Edit'>
          <Button
            type='text'
            onClick={() => {
              edit(row);
            }}
            icon={<AiOutlineEdit />}
          />
        </Tooltip>
      )}
      {actions.delete && (
        <Popconfirm
          title='Are you sure to delete this?'
          onConfirm={async () => {}}
          okText='Yes'
          cancelText='No'
        >
          <Tooltip title='Delete'>
            <Button type='text' icon={<AiOutlineDelete />} />
          </Tooltip>
        </Popconfirm>
      )}
      {actions.mark && (
        <Popconfirm
          title='Are you sure to mark this as paid?'
          onConfirm={async () => {}}
          okText='Yes'
          cancelText='No'
        >
          <Tooltip title='Mark as Paid'>
            <Button type='text' icon={<AiOutlineCheck />} />
          </Tooltip>
        </Popconfirm>
      )}
    </Space>
  );
}

export default ActionRow;
