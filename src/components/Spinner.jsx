function Spinner() {
  return (
    <div
      style={{
        display: "inline-block",
        width: "16px",
        height: "16px",
        border: "2px solid #ccc",
        borderTopColor: "#333",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
        marginRight: "8px",
        verticalAlign: "middle",
      }}
    />
  );
}

export default Spinner;