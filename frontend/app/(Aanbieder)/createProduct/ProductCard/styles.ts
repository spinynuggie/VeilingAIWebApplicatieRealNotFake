// src/components/ProductCard/styles.ts
import { CSSProperties } from "react";

export const styles: { [key: string]: CSSProperties } = {
  card: {
    backgroundColor: "#D1FADF",
    borderRadius: "12px",
    padding: "20px", // Reduced padding
    width: "320px", // Slightly more compact width
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    color: "#000",
    minHeight: "480px",
    border: "1px solid #c2ebcf",
  },
  title: {
    textAlign: "center",
    fontSize: "20px", // Reduced from 24px
    fontWeight: "bold",
    margin: "0 0 15px 0",
    minHeight: "24px",
    color: "#1a4d2e",
  },
  imagePlaceholder: {
    backgroundColor: "#90B498",
    width: "100%",
    height: "180px", // Reduced from 200px
    borderRadius: "8px",
    marginBottom: "15px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  description: {
    fontSize: "13px", // Reduced from 14px
    lineHeight: "1.4",
    marginBottom: "15px",
    minHeight: "50px",
    whiteSpace: "pre-wrap",
    color: "#333",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #90B498",
    margin: "0 0 15px 0",
    width: "100%",
  },
  specHeader: {
    fontWeight: "bold",
    fontSize: "13px",
    marginBottom: "8px",
  },
  specList: {
    margin: "0 0 20px 20px",
    padding: 0,
    fontSize: "13px",
    flexGrow: 1,
    color: "#444",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "auto",
  },
  btnDark: {
    backgroundColor: "#90B498",
    border: "none",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    cursor: "pointer",
    flex: 1.2,
    textAlign: "center",
    color: 'white',
    fontWeight: 'bold',
    transition: "background 0.2s",
  },
  inputBox: {
    backgroundColor: "#AEDCB8",
    border: "1px solid #90B498",
    borderRadius: "6px",
    padding: "8px 5px",
    fontSize: "14px",
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    width: "60px",
    outline: "none",
  },
  priceDisplay: {
    backgroundColor: "#90B498",
    borderRadius: "6px",
    padding: "10px",
    textAlign: "center",
    fontWeight: "bold",
    color: "white",
    fontSize: "16px",
    width: "100%",
  },
};
