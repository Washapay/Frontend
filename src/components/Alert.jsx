function Alert({ type = "error", children }) {
  if (!children) return null;

  const styles = {
    error: { color: "#c0392b", background: "#fdecea" },
    success: { color: "#27ae60", background: "#eafaf1" },
  };

  return (
    <p
      style={{
        ...styles[type],
        padding: "8px 12px",
        borderRadius: "4px",
        marginTop: "8px",
      }}
    >
      {children}
    </p>
  );
}

export default Alert;