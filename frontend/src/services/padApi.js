import axios from 'axios';

const baseURL = import.meta.env.VITE_BASEURL || 'http://localhost:8000';

export const padApi = axios.create({
  baseURL,
});

export const buildPadPath = (padName) => `/api/pads/${encodeURIComponent(padName)}`;

export const buildPadDownloadUrl = (padName, fileId, password = '') => {
  const params = new URLSearchParams();
  if (password) params.set('password', password);
  const query = params.toString();
  return `${baseURL}${buildPadPath(padName)}/files/${encodeURIComponent(fileId)}/download${query ? `?${query}` : ''}`;
};

export const fetchPadMeta = (padName) => padApi.get(`${buildPadPath(padName)}/meta`);
export const createPad = (padName, payload) => padApi.post(`${buildPadPath(padName)}/create`, payload);
export const verifyPad = (padName, password) => padApi.post(`${buildPadPath(padName)}/verify`, { password });
export const fetchPad = (padName, password = '') =>
  padApi.get(buildPadPath(padName), {
    params: password ? { password } : undefined,
  });
export const savePad = (padName, usercontext, password = '') =>
  padApi.post(`/v1/${encodeURIComponent(padName)}`, { usercontext }, {
    params: password ? { password } : undefined,
  });
export const fetchPadFiles = (padName, password = '') =>
  padApi.get(`${buildPadPath(padName)}/files`, {
    params: password ? { password } : undefined,
  });
export const uploadPadFile = (padName, file, password = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('padName', padName);
  if (password) formData.append('password', password);

  return padApi.post(`${buildPadPath(padName)}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
