
import { Comment } from "@ant-design/compatible";
import { DeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Popconfirm, Space, Tooltip } from "antd";
import { Timestamp } from "firebase/firestore";
import moment from "moment";
import { useState } from "react";

export const CommentCard: React.FC<{
  id: string;
  isAdmin?: boolean;
  author?: string;
  avatar?: string;
  content?: string;
  isChild?: boolean;
  date?: Timestamp;
  children?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: any;
  onChange?: any;
  replyingTo?: any;
  deleteComment: any;
}> = ({
  id,
  author,
  avatar,
  content,
  date,
  children,
  isChild,
  loading,
  disabled,
  isAdmin,
  onChange,
  onClick,
  replyingTo,
  deleteComment,
}) => {
  const [showInput, toggleInput] = useState(false);
  return (
    <Comment
      key={id}
      actions={[
        <div>
          <span
            style={{ color: "#001529", fontWeight: "bold", fontSize: 11 }}
            key="comment-nested-reply-to"
          >
            {!showInput && !isChild && !isAdmin && (
              <span
                onClick={() => toggleInput(true)}
                style={{ cursor: "pointer" }}
              >
                Reply
              </span>
            )}
            <span
              style={{
                color: "rgba(0, 0, 0, 0.65)",
                fontWeight: "normal",
                paddingLeft: 10,
                fontSize: 10,
              }}
            >
              {date
                ? moment(date.toDate()).isSame(moment(), "day")
                  ? moment(date.toDate()).format("h:mm A") // Display time if same day
                  : moment(date.toDate()).format("MMM D, YYYY h:mm A") // Display full date and time if different day
                : "Just Now"}
            </span>
          </span>
          {showInput && (
            <div style={{ width: "100%" }}>
              <br />
              <Input.TextArea onChange={onChange} />
              <Space
                style={{
                  paddingTop: 5,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => toggleInput(false)}
                  type="default"
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  loading={loading}
                  disabled={disabled}
                  onClick={async () => {
                    try {
                      await onClick(replyingTo, toggleInput);
                      toggleInput(false);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                  size="small"
                >
                  Post
                </Button>
              </Space>
            </div>
          )}
        </div>,
      ]}
      author={author || "Anonymous"}
      avatar={
        avatar ? (
          <Avatar style={{ marginTop: 30 }} src={avatar} alt="Admin" />
        ) : (
          <img
            style={{ marginTop: 27, borderRadius: 16, background: "#000" }}
            src="./ons-logo.png"
            width={32}
            alt="logo"
          />
        )
      }
      content={
        <div>
          <Space>
            <p
              style={{
                borderRadius: 10,
                background: "#f4f4f4",
                padding: 10,
                width: "fit-content",
                minWidth: 120,
                maxWidth: "95%",
              }}
            >
              {content ||
                "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure)."}
            </p>
            <Popconfirm
              title="Are you sure to delete this comment?"
              onConfirm={deleteComment}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined
                  disabled={loading}
                  style={{ color: "#d2020e", cursor: "pointer" }}
                  color="#d2020e"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        </div>
      }
    >
      {children}
    </Comment>
  );
};
