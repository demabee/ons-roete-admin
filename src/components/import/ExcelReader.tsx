import React, { useMemo, useState } from "react";
import { DocumentData, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../firebase/config";
import { Button, Col, notification, Row } from "antd";

const DownloadCSVButton = () => {
  const handleDownload = () => {
    // Logic to download CSV file
    // For local files, you can use <a> tag with 'download' attribute
    const url = "./node_csv_template.csv";
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "node_csv_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button type="link" onClick={handleDownload}>
      Download CSV Template
    </Button>
  );
};

interface EventFormProps {
  callback: any;
  nodes: any[];
}

const CSVImport: React.FC<EventFormProps> = ({ callback, nodes }) => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const itemNums = useMemo(() => {
    if (nodes && nodes.length > 0) {
      return nodes.map((p) => p.itemNo);
    }
    return [];
  }, [nodes]);

  // Function to handle CSV file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) {
          const text = e.target.result as string;
          const cleanedText = text.replace(/\r/g, ""); // Remove \r characters
          const data = parseCsv(cleanedText);
          setCsvData(data);
        }
      };
      reader.readAsText(file);
    }
  };

  // Function to parse CSV text while preserving empty cells and handling JSON-like fields
  const parseCsv = (text: string) => {
    const rows = text.split("\n");
    const data = rows.map((row) => {
      // Split the row while preserving empty cells
      const cells = row.split(/,(?!\s)/);
      // Process each cell to handle JSON-like strings
      return cells.map((cell) => {
        // Check if the cell looks like a JSON string
        if (cell.startsWith('"') && cell.endsWith('"')) {
          try {
            // Attempt to parse the JSON-like string
            return JSON.parse(cell);
          } catch (error) {
            // If parsing fails, return the cell as is
            return cell;
          }
        } else {
          // If not a JSON-like string, return the cell as is
          return cell;
        }
      });
    });
    return data;
  };

  // Function to import CSV data to Firestore
  const importToFirestore = async () => {
    setLoading(true);
    setProgress(0);

    try {
      const totalDocs = csvData.length - 1; // Excluding the first row (column names)
      let importedDocs = 0;

      await Promise.all(
        csvData.slice(1).map(async (row) => {
          // Exclude the first row (column names)

          const data: DocumentData = {};

          csvData[0].forEach((columnName, index) => {
            const fieldName = camelCase(columnName);
            // If the cell is empty, set it as an empty string
            data[fieldName] = row[index] === undefined ? "" : row[index];
          });

          if ((itemNums ?? []).includes(data?.itemNo)) {
            notification.error({
              message: "Skipping nodes with existing item number.",
              description: `Skipped node #${data?.itemNo}`,
              placement: "topRight",
            });
            return;
          }

          if (!data?.large || !data?.medium || !data?.thumb || !data?.highres) {
            notification.error({
              message: "Skipping nodes with incomplete image URLs!",
              description: `Skipped node #${data?.itemNo}`,
              placement: "topRight",
            });
            return;
          }

          const uid = uuidv4();
          await setDoc(doc(db, "nodes", uid), {
            ...data,
            id: uid,
            itemCategory: data?.itemCategory ? [data?.itemCategory] : [],
            images: [data?.highres || data?.large || data?.medium],
            dateCreated: serverTimestamp(),
          });

          importedDocs++;
          const progressPercentage = Math.round(
            (importedDocs / totalDocs) * 100
          );
          setProgress(progressPercentage);
        })
      );

      setLoading(false);
      callback();
      notification.info({
        message: "Successfully imported nodes!",
        placement: "topRight",
      });
      setCsvData([]);
      console.log("Data imported successfully.");
    } catch (error) {
      notification.error({
        message: "Something went wrong!",
        description: "Error importing nodes.",
        placement: "topRight",
      });
      console.error("Error importing data: ", error);
    }
  };

  // Function to convert string to camelCase
  const camelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  };

  return (
    <Row>
      <Col span={24}>
        <input type="file" disabled={loading} onChange={handleFileUpload} />
      </Col>
      <Col span={24}>
        <DownloadCSVButton />
        <br />
        {loading && <p>Importing data... Progress: {progress}%</p>}
      </Col>
      <br />
      <Col span={24}>
        {csvData && (csvData ?? []).length > 0 && (
          <div
            style={{
              display: "flex",
              paddingTop: 20,
              justifyContent: "flex-end",
            }}
          >
            <Button
              type="primary"
              loading={loading}
              onClick={importToFirestore}
            >
              Import to Firestore
            </Button>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default CSVImport;
