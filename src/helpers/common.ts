import { UploadFile } from "antd";

export const toSentenceCase = (name: any) => {
  const result = (name ?? "").replace(/([A-Z])/g, " $1");

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export function extractFileNameFromUrl(url: string) {
  // Split the URL by slashes (/) to get individual parts
  const parts = url.split("/");
  // Get the last part of the URL which should be the file name
  const fileNameWithQuery = parts[parts.length - 1];
  // Remove any query parameters from the file name
  const fileName = fileNameWithQuery.split("?")[0];
  return fileName;
}


export const checkFileSize = (file: UploadFile<any>) => {
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (!file.size) {
    return false;
  }
  const isSmallEnough = file.size <= maxSize;
  return isSmallEnough;
};

export const validateFileType = ({ type }: UploadFile, allowedTypes?: string[]) => {
  if (!allowedTypes) {
    return true;
  }

  if (type) {
    return allowedTypes.includes(type);
  }
};