import { notification } from "antd";

type NotificationType = 'success' | 'info' | 'warning' | 'error';

export const openNotificationWithIcon = (type: NotificationType, message: string, description: string) => {
  notification[type]({
    message: message,
    description: description,
  });
};