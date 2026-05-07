import api from './axios';

export const getAllNotifications = () =>
  api.get('/notifications');

export const getNotificationsByEmail = (email) =>
  api.get(`/notifications/recipient/${encodeURIComponent(email)}`);

export const getPendingNotifications = () =>
  api.get('/notifications/pending');
