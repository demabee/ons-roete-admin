// NotificationComponent.tsx
import { notification } from "antd";
import { NotificationPlacement } from "antd/es/notification/interface";
import { addDoc, collection } from "firebase/firestore";
import React from "react";
import { db } from "../../firebase/config";

const openNotification = (placement: NotificationPlacement) => {
  notification.info({
    message: "New Message",
    description: "You have a new message!",
    placement,
  });

  // Store notification data in Firestore
  const notificationData = {
    message: "New Message",
    timestamp: new Date(),
  };

  addDoc(collection(db, "notifications"), notificationData);
};

const NotificationComponent: React.FC = () => {
  return (
    <div>
      <button onClick={() => openNotification("topLeft")}>
        Show Notification
      </button>
    </div>
  );
};

export default NotificationComponent;
