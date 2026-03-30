// src/services/userService.js
import api from './api';

export const searchUsers = (q) =>
  api.get(`/users/search?q=${encodeURIComponent(q)}`).then((r) => r.data);

export const getUserById = (id) =>
  api.get(`/users/${id}`).then((r) => r.data);

export const updateProfile = async ({ username, bio, avatarUri }) => {
  const form = new FormData();
  if (username)          form.append('username', username);
  if (bio !== undefined) form.append('bio', bio);
  if (avatarUri) {
    form.append('avatar', {
      uri:  avatarUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });
  }
  const res = await api.put('/users/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
