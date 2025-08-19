import FileResizer from 'react-image-file-resizer';

export const resizeFile = (file: Blob, maxWidth: number, maxHeight: number) => {
  return new Promise((resolve, reject) => {
    FileResizer.imageFileResizer(
      file,
      maxWidth,
      maxHeight,
      "JPEG",
      80,
      0,
      (uri) => {
        console.log(uri);
        resolve(uri);
      },
      "file"
    );
  });
};