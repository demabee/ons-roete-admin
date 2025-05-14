import React, { SetStateAction, useEffect, useState } from "react";
import { Modal, Button, Descriptions, Typography, List, Avatar, Space, Input, Spin } from "antd";
import { toSentenceCase } from "../../helpers/common";
import dayjs from "dayjs";
import { CommentCard } from "../../components/CommentCard";
import { useFetchComments } from "../../hooks/comments/useFetchComments";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

interface RequestFormProps {
  visible: boolean;
  onCancel: () => void;
  request: any;
}

export const RequestView: React.FC<RequestFormProps> = ({
  visible,
  onCancel,
  request
}) => {
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const { comments, refetch, loading: fetchingComments } = useFetchComments();

  useEffect(() => {
    if (request?.id) {
      refetch(request?.id);
    }
  }, [refetch, request]);

  const handleDeleteComment = async (commentId: string, replyingToId?: string) => {
    if (!commentId || !request?.id) return;

    setLoadingComments(true);
    try {
      let commentRef;
      commentRef = doc(db, "requests", request.id, "comments", commentId);
      await deleteDoc(commentRef);

      request?.id && (await refetch(request?.id, "requests"));
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (replyingTo?: any, toggleInput?: any) => {
    if (newComment) {
      // Add a new comment to the comments collection
      setLoadingComments(true);
      try {
        const commentData: any = {
          author: "Admin",
          text: newComment,
          timestamp: serverTimestamp(),
        };
        if (!request?.id) return;
        // Add a new comment document to the comments subcollection of the community
        const commentsRef = collection(db, "requests", request.id, "comments");
        await addDoc(commentsRef, {
          ...commentData,
          author: "Admin",
        });

        request?.id && (await refetch(request?.id, "requests"));
        toggleInput && toggleInput(false);
        setNewComment("");
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingComments(false);
      }
    }
  };
  return (
    <Modal
      title="View Request"
      open={visible}
      width={"70dvw"}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
    >
      <Descriptions layout="vertical" bordered>
        <Descriptions.Item label="Full Name">
          {request?.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {request?.email}
        </Descriptions.Item>
        <Descriptions.Item label="Phone Number">
          {request?.phoneNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {toSentenceCase(request?.status || "Pending")}
        </Descriptions.Item>
        <Descriptions.Item label="Date Requested">
          {request?.createdAt
            ? dayjs(request?.createdAt.toDate()).format(
              "YYYY-MM-DD hh:mm a"
            )
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Date Preferred">
          {request?.dateTime
            ? dayjs(request?.dateTime.toDate()).format(
              "YYYY-MM-DD hh:mm a"
            )
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {request?.description}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Typography.Title level={5} >Collection</Typography.Title>
      <List
        itemLayout="horizontal"
        dataSource={request?.collection || []}
        renderItem={(item: any, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={item?.thumb && <Avatar src={item?.thumb} />}
              title={`${item?.itemNum || item?.itemNo} - ${item?.technicalDescription}`}
              description={item?.bANQADescriptionES}
            />
          </List.Item>
        )}
      />
      <br />

      <h4>Comments</h4>

      {fetchingComments ? (
        <Spin />
      ) : (comments || []).length <= 0 ? (
        <i>No Comments</i>
      ) : (
        (comments || []).map(
          (c: {
            timestamp: Timestamp | undefined;
            authorData: any;
            replies: any;
            id: string;
            author: string;
            text: string | undefined;
          }) => (
            <CommentCard
              id={c?.id}
              content={c?.text}
              author={
                c?.authorData?.firstName ? `${c?.authorData?.firstName} ${c?.authorData?.lastName}` : c?.author
              }
              avatar={c?.authorData?.avatar}
              date={c?.timestamp}
              loading={loadingComments}
              disabled={loadingComments}
              deleteComment={() => handleDeleteComment(c?.id)}
              onChange={(v: { target: { value: SetStateAction<string> } }) => setNewComment(v?.target?.value)}
              onClick={(v: any) => handlePostComment(v)}
              replyingTo={c}
            >
              {c?.replies &&
                (c?.replies ?? []).map(
                  (item: {
                    author: string | undefined;
                    authorData: any;
                    text: string | undefined;
                    id: string;
                    timestamp: Timestamp | undefined;
                  }) => (
                    <CommentCard
                      id={item?.id}
                      isChild={true}
                      content={item?.text}
                      deleteComment={() => handleDeleteComment(item?.id, c?.id)}
                      author={
                        item?.authorData?.firstName
                          ? `${item?.authorData?.firstName} ${item?.authorData?.lastName}`
                          : item?.author
                      }
                      avatar={item?.authorData?.avatar}
                      date={item?.timestamp}
                      onClick={undefined}
                      onChange={undefined}
                    />
                  )
                )}
            </CommentCard>
          )
        )
      )}
      <div style={{ width: "100%" }}>
        <br />
        <Input.TextArea value={newComment} onChange={(v) => setNewComment(v?.target?.value)} />
        <Space
          style={{
            paddingTop: 5,
            width: "100%",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            loading={loadingComments}
            disabled={loadingComments || !newComment}
            onClick={() => handlePostComment()}
            size="small"
          >
            Post
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
