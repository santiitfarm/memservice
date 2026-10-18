import { convertNumberToText } from "./convertNumberToText";

export const VoucherTemplateOrder = (orderData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Receipt - Mem Service</title>
  <style>
    .body {
      font-family: 'Arial', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
      position: relative;
    }
    .containerm {
      width: 100%;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      position: relative;
    }
    .watermark{
      position: absolute;
      top: 10%;
      left: -20%;
      width: 140%;
      height: 100%;
      background-image: url('https://res.cloudinary.com/dbr3st8vn/image/upload/v1733630577/logo_luatve.png');
      background-size: 40%;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.1;
    }
    .headert {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .headert h1 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
    }
    .headert h2 {
      margin: 10px 0;
      color: #34495e;
      font-size: 18px;
    }
    .divider {
      border-top: 1px dashed #bbb;
      margin: 15px 0;
    }
    .customer-info, .payment-info {
      margin: 15px 0;
    }
    .customer-info p, .payment-info p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
      .stotals{
      background-color: #f2f2f2;
      font-weight: bold;
      }
      tr th:nth-child(4), tr td:nth-child(4) {
        text-align: right;
      }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals div {
      margin: 5px 0;
    }
    .totals strong {
      font-size: 14px;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
    }
    .signature-line {
      width: 200px;
      text-align: center;
    }
    .signature-line p {
      margin-top: 5px;
      border-top: 1px solid #333;
      padding-top: 5px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-style: italic;
      color: #7f8c8d;
    }
    .logo {
      width: 150px;
      height: auto;
      margin: 2px auto;
    }
      .payment-info {
        text-transform: capitalize;
      }
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body class="body">
  <div class="containerm">
  <div class="watermark"></div>

    <div class="headert">
    <img class="logo" src="https://res.cloudinary.com/dbr3st8vn/image/upload/v1733630577/logo_luatve.png">
      <h2>SALES RECEIPT</h2>
      <p>Order #: ${orderData.order_number}</p>
      <p>Date: ${new Date(orderData.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      })}</p>
    </div>
    
    <div class="customer-info">

      <p><strong>Customer:</strong> ${orderData.customer.customer_name}</p>
      <p><strong>Mobile:</strong> ${
        orderData.customer.phone_number || "N/A"
      }</p>
      <p><strong>Email:</strong> ${orderData.customer.email || "N/A"}</p>
      <p><strong>Address:</strong> ${orderData.customer.address || "N/A"}</p>
    </div>
    
    <div class="divider"></div>
    
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderData.items
          .map(
            (item) => `
              <tr>
                <td>
                  ${item.title} 
                </td>
                <td>${item.quantity}</td>
                <td>৳${Number(item.price).toFixed(2)}</td>
                <td>৳${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `
          )
          .join("")}
           <tr class="stotals">
                <td></td>
                <td></td>
                <td style="text-align:right"> <strong>Subtotal: </strong></td>
                <td><strong> ৳${(
                  Number(orderData.total_amount) -
                  Number(orderData.shipping_details.shipping_charge || 0)
                ).toFixed(2)}</strong} </strong></td>
              </tr>
      </tbody>
      
    </table>

    
    <div class="payment-info">
      <p><strong>Payment Method:</strong> ${
        orderData.payment_info.method === "cod"
          ? "Cash on Delivery"
          : orderData.payment_info.method || "N/A"
      } , ${orderData.payment_info.transaction_id || ""}</p>
      <p><strong>Order Status:</strong> ${orderData.status}</p>
     
    </div>
    
    <div class="totals">
          <div><strong>Delivery Charge:</strong> ৳${Number(
            orderData.shipping_details.shipping_charge || 0
          ).toFixed(2)}</div>
    <div class="divider"></div>
      <div><strong>Total Amount:</strong> ৳${Number(
        orderData.total_amount
      ).toFixed(2)}</div>
      <div><strong>Paid Amount:</strong> ৳${Number(
        orderData.payment_info.transaction_amount || 0
      ).toFixed(2)}</div>
    <div class="divider"></div>

      <div><strong>Due:</strong> ৳${
        Number(orderData.total_amount) -
        Number(orderData.payment_info?.transaction_amount || 0)
      }</div>
    </div>
    
    
    <h3 style="text-transform: uppercase; text-align: center;">
      In Words: ${convertNumberToText(orderData.total_amount || 0)}
    </h3>
    

    
    <div class="footer">
      <p>Thank you for shopping with us!</p>
      <p>Please visit again <a target="_blank" href='https://www.memservicebd.com'>www.memservicebd.com</a></p>
    </div>
  </div>
</body>
</html>
`;
