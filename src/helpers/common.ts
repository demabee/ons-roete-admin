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


export const getUniqueElements = (arr1: any[], arr2: any[]) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  const mergedSet = new Set([
    ...arr1.filter((item) => !set2.has(item)),
    ...arr2.filter((item) => !set1.has(item)),
  ]);

  return Array.from(mergedSet);
}