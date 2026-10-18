"use client";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// // Register a font (optional, for custom fonts)
// Font.register({
//   family: "Arial",
//   src: "https://path-to-your-font-file.ttf",
// });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Arial",
    fontSize: 12,
    padding: 20,
    lineHeight: 1.6,
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    borderBottom: "2px solid #333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 18,
    color: "#34495e",
  },
  customerInfo: {
    marginVertical: 10,
  },
  table: {
    marginVertical: 15,
    borderCollapse: "collapse",
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    flex: 1,
    padding: 5,
  },
  totals: {
    textAlign: "right",
    marginTop: 20,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontStyle: "italic",
    color: "#7f8c8d",
  },
});

const VoucherTemplateOrder = ({ orderData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          src="https://res.cloudinary.com/dbr3st8vn/image/upload/v1733630577/logo_luatve.png"
          style={{ width: 150, margin: "0 auto" }}
        />
        <Text style={styles.subtitle}>SALES RECEIPT</Text>
        <Text>Order #: {orderData.order_number}</Text>
        <Text>
          Date:{" "}
          {new Date(orderData.createdAt).toLocaleString("en-US", {
            timeZone: "Asia/Dhaka",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          })}
        </Text>
      </View>

      {/* Customer Information */}
      <View style={styles.customerInfo}>
        <Text>Customer: {orderData.customer.customer_name}</Text>
        <Text>Mobile: {orderData.customer.phone_number || "N/A"}</Text>
        <Text>Email: {orderData.customer.email || "N/A"}</Text>
        <Text>Address: {orderData.customer.address || "N/A"}</Text>
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Product</Text>
          <Text style={styles.tableCell}>Qty</Text>
          <Text style={styles.tableCell}>Price</Text>
          <Text style={styles.tableCell}>Total</Text>
        </View>
        {orderData.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.title}</Text>
            <Text style={styles.tableCell}>{item.quantity}</Text>
            <Text style={styles.tableCell}>
              ৳{Number(item.price).toFixed(2)}
            </Text>
            <Text style={styles.tableCell}>
              ৳{(item.quantity * item.price).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <Text>
          Subtotal: ৳
          {(
            Number(orderData.total_amount) -
            Number(orderData.shipping_details.shipping_charge || 0)
          ).toFixed(2)}
        </Text>
        <Text>
          Delivery Charge: ৳
          {Number(orderData.shipping_details.shipping_charge || 0).toFixed(2)}
        </Text>
        <Text>Total Amount: ৳{Number(orderData.total_amount).toFixed(2)}</Text>
        <Text>
          Paid Amount: ৳
          {Number(orderData.payment_info.transaction_amount || 0).toFixed(2)}
        </Text>
        <Text>
          Due: ৳
          {Number(orderData.total_amount) -
            Number(orderData.payment_info.transaction_amount || 0)}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for shopping with us!</Text>
        <Text>
          Please visit again{" "}
          <a href="https://www.memservicebd.com">www.memservicebd.com</a>
        </Text>
      </View>
    </Page>
  </Document>
);

export default VoucherTemplateOrder;
