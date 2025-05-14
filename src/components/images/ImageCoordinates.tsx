import { Avatar } from "antd";
import React, { useEffect, useState } from "react";
import "./ImageWithCircles.css"; // Create a CSS file for styling

interface Circle {
  x: number;
  y: number;
  id?: any;
}

// Extension interface with additional property
interface ExtendedCircle extends Circle {
  url?: string;
  name?: string;
}

interface ImageWithCirclesProps {
  imageUrl: string;
  circles: Circle[];
  handleCircles: any;
  nodes: any[];
  projectId: string | number;
}

const ImageWithCircles: React.FC<ImageWithCirclesProps> = ({
  imageUrl,
  projectId,
  circles,
  nodes,
  handleCircles,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<ExtendedCircle>({
    x: 0,
    y: 0,
  });
  const handleImageClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const boundingRect = (
      event.target as HTMLDivElement
    ).getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    // Add the new circle coordinates to the state
    handleCircles(x, y, projectId);
  };

  useEffect(() => {
    console.log(circles);
  }, [circles]);

  const handleMouseEnter = (circle: ExtendedCircle) => {
    setTooltipVisible(true);
    console.log(nodes, circle);
    const prod = (nodes ?? []).find((p) => p.id === circle.id);
    console.log(prod);
    setTooltipPosition({
      x: circle.x,
      y: circle.y,
      id: circle?.id,
      url: prod?.url ?? "",
      name: prod?.name ?? "",
    });
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <div className="image-container">
      {/* Render circles dynamically based on state */}
      {(circles ?? []).map(
        (circle: Circle, index: React.Key | null | undefined) => (
          <div>
            <div
              key={index}
              className="circle-overlay"
              style={{ top: `${circle.y}px`, left: `${circle.x}px` }}
              onMouseEnter={() => handleMouseEnter(circle)}
              onMouseLeave={handleMouseLeave}
            />
          </div>
        )
      )}
      {tooltipVisible && (
        <div
          className="tooltip"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            zIndex: 1,
            textAlign: "center",
          }}
        >
          {tooltipPosition?.url ? (
            <>
              <Avatar src={tooltipPosition?.url} size={50} shape="square" />
              <div style={{ paddingLeft: 10 }}>{tooltipPosition?.name}</div>
            </>
          ) : (
            "Loading..."
          )}
        </div>
      )}
      <img
        src={imageUrl}
        width="100%"
        alt="Node"
        onClick={handleImageClick}
      />
    </div>
  );
};

export default ImageWithCircles;
