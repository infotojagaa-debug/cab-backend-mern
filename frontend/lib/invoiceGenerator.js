// Invoice generation utility
export function generateInvoiceHTML(invoiceData) {
  const {
    invoiceNumber,
    date,
    completedAt,
    customer,
    driver,
    ride,
    fare,
    paymentStatus,
  } = invoiceData;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          max-width: 850px;
          margin: 0 auto;
          padding: 60px 40px;
          color: #1f2937;
          background: #ffffff;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 50px;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 30px;
        }
        .brand-section {
          text-align: left;
        }
        .company-name {
          font-size: 36px;
          font-weight: 900;
          color: #111827;
          letter-spacing: -0.05em;
          text-transform: uppercase;
          font-style: italic;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .company-name span {
          color: #f59e0b;
        }
        .invoice-type {
          font-size: 10px;
          font-weight: 800;
          color: #f59e0b;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-top: 4px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-title {
          font-size: 28px;
          font-weight: 900;
          color: #111827;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }
        .invoice-number {
          font-size: 14px;
          font-weight: 700;
          color: #6b7280;
          margin-top: 4px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: #f59e0b;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          border-left: 4px solid #f59e0b;
          padding-left: 12px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .card {
          background: #f9fafb;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #f3f4f6;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .info-item:last-child {
          margin-bottom: 0;
        }
        .info-label {
          font-weight: 700;
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .info-value {
          color: #111827;
          font-size: 13px;
          font-weight: 600;
        }
        .ride-details-card {
          background: #111827;
          color: white;
          padding: 30px;
          border-radius: 24px;
          margin-bottom: 30px;
          position: relative;
          overflow: hidden;
        }
        .ride-details-card::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }
        .route {
          position: relative;
          padding-left: 30px;
          margin-bottom: 25px;
        }
        .route::before {
          content: "";
          position: absolute;
          left: 6px;
          top: 15px;
          bottom: -15px;
          width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }
        .route:last-child::before {
          display: none;
        }
        .route-dot {
          position: absolute;
          left: 0;
          top: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f59e0b;
          border: 3px solid #111827;
          z-index: 1;
        }
        .route-dot.drop {
          background: #3b82f6;
        }
        .route-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.2em;
          margin-bottom: 4px;
        }
        .route-address {
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
        }
        .fare-container {
          background: #ffffff;
          border: 2px solid #f3f4f6;
          border-radius: 24px;
          overflow: hidden;
        }
        .fare-table {
          width: 100%;
          border-collapse: collapse;
        }
        .fare-table td {
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }
        .fare-label {
          font-weight: 700;
          color: #6b7280;
          font-size: 13px;
        }
        .fare-value {
          text-align: right;
          font-weight: 800;
          color: #111827;
          font-size: 15px;
        }
        .total-row {
          background: #f59e0b;
          color: #111827;
        }
        .total-row td {
          border-bottom: none;
          padding: 24px;
        }
        .total-label {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .total-value {
          font-size: 32px;
          font-weight: 950;
          letter-spacing: -0.05em;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .status-paid {
          background: #ecfdf5;
          color: #059669;
        }
        .status-pending {
          background: #fffbeb;
          color: #d97706;
        }
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #f3f4f6;
          text-align: center;
        }
        .footer p {
          margin: 4px 0;
          font-size: 12px;
          color: #9ca3af;
          font-weight: 600;
        }
        .footer .thank-you {
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand-section">
          <div class="company-name">Wee<span>Fly</span> Cabs</div>
          <div class="invoice-type">Official Tax Invoice</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-title">Invoice</div>
          <div class="invoice-number">${invoiceNumber}</div>
        </div>
      </div>

      <div class="info-grid section">
        <div class="card">
          <div class="section-title">Recipient</div>
          <div class="info-item">
            <span class="info-label">Name</span>
            <span class="info-value">${customer.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Phone</span>
            <span class="info-value">${customer.phone}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email</span>
            <span class="info-value">${customer.email}</span>
          </div>
        </div>
        <div class="card">
          <div class="section-title">Provider</div>
          ${driver ? `
          <div class="info-item">
            <span class="info-label">Captain</span>
            <span class="info-value">${driver.name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Contact</span>
            <span class="info-value">${driver.phone}</span>
          </div>
          ` : `
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value">Unassigned</span>
          </div>
          `}
          <div class="info-item">
            <span class="info-label">Payment</span>
            <span class="status-badge status-${paymentStatus}">${paymentStatus}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Mission Logistics</div>
        <div class="ride-details-card">
          <div class="route">
            <div class="route-dot"></div>
            <div class="route-label">Departure Grid</div>
            <div class="route-address">${ride.pickup}</div>
          </div>
          <div class="route">
            <div class="route-dot drop"></div>
            <div class="route-label">Arrival Terminal</div>
            <div class="route-address">${ride.dropoff}</div>
          </div>
          
          <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
            <div>
              <p class="route-label">Asset Type</p>
              <p style="font-weight: 700; font-size: 13px;">${ride.cabType}</p>
            </div>
            <div>
              <p class="route-label">Distance</p>
              <p style="font-weight: 700; font-size: 13px;">${ride.distance}</p>
            </div>
            <div>
              <p class="route-label">Completed</p>
              <p style="font-weight: 700; font-size: 13px;">${formatDate(completedAt || date)}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Final Settlement</div>
        <div class="fare-container">
          <table class="fare-table">
            <tr>
              <td class="fare-label">Operational Fare</td>
              <td class="fare-value">₹${fare.baseFare}</td>
            </tr>
            <tr>
              <td class="fare-label">Service Tax (5%)</td>
              <td class="fare-value">₹${fare.tax}</td>
            </tr>
            <tr class="total-row">
              <td class="total-label">Grand Total</td>
              <td class="total-value" style="text-align: right;">₹${fare.total}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="footer">
        <p class="thank-you">Safe Travels with WeeFly</p>
        <p>This is a computer-generated document. No signature required.</p>
        <p>Support: support@weeflycabs.com | WeeFly Cabs Pvt Ltd</p>
      </div>
    </body>
    </html>
  `;
}

export function downloadInvoice(invoiceData) {
  const html = generateInvoiceHTML(invoiceData);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${invoiceData.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
