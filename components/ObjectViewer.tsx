import React from "react";

interface ObjectViewerProps {
  object?: any;
}

const ObjectViewer: React.FC<ObjectViewerProps> = ({ object }) => {
  if (!object) {
    return <div></div>;
  }
  const renderObject = (obj: any) => {
    if (typeof obj === "object" && obj !== null) {
      return (
        <ul>
          {Object.entries(obj).map(([key, value]) => (
            <li key={key}>
              <strong>{key}: </strong>
              {renderObject(value)}
            </li>
          ))}
        </ul>
      );
    } else {
      return <span>{String(obj)}</span>;
    }
  };

  return <div>{renderObject(object)}</div>;
};

export default ObjectViewer;
