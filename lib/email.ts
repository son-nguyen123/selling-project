import nodemailer from 'nodemailer'

// ---------------------------------------------------------------------------
// Gmail SMTP transporter
// Requires the following environment variables:
//   GMAIL_USER   – your Gmail address (e.g. you@gmail.com)
//   GMAIL_PASS   – a Gmail App Password (NOT your normal password)
//                  https://myaccount.google.com/apppasswords
// ---------------------------------------------------------------------------
function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_PASS

  if (!user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,         // SSL
    secure: true,      // use TLS
    auth: { user, pass },
  })
}

interface OrderItem {
  name: string
  price: number
  quantity: number
  download_link?: string | null
}

interface SendOrderEmailOptions {
  to: string
  customerName: string
  orderId: string
  items: OrderItem[]
  totalPrice: number
}

// ---------------------------------------------------------------------------
// Build the HTML body for an order-confirmation email
// ---------------------------------------------------------------------------
function buildOrderEmailHtml(
  customerName: string,
  orderId: string,
  items: OrderItem[],
  totalPrice: number,
): string {
  // Rows for each purchased product
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
        </tr>`,
    )
    .join('')

  // Download links section (only shown when at least one item has a link)
  const downloadLinks = items.filter((i) => i.download_link)
  const downloadSection =
    downloadLinks.length > 0
      ? `<div style="margin-top:24px;padding:16px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;">
          <h3 style="margin:0 0 12px;color:#166534;font-size:16px;">🔗 Link tải xuống của bạn</h3>
          <ul style="margin:0;padding-left:20px;">
            ${downloadLinks
              .map(
                (item) =>
                  `<li style="margin-bottom:8px;">
                    <strong>${item.name}</strong>:<br/>
                    <a href="${item.download_link}" style="color:#2563eb;word-break:break-all;">${item.download_link}</a>
                  </li>`,
              )
              .join('')}
          </ul>
          <p style="margin:12px 0 0;font-size:12px;color:#166534;">Vui lòng lưu lại link tải để sử dụng khi cần.</p>
        </div>`
      : ''

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"/></head>
<body style="font-family:sans-serif;background:#f9fafb;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#e53e3e;padding:24px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;">Project Selling</h1>
      <p style="margin:4px 0 0;color:#fecaca;font-size:14px;">Đặt hàng thành công!</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;">Xin chào <strong>${customerName}</strong>,</p>
      <p style="color:#374151;">Đơn hàng <strong>#${orderId.slice(0, 8).toUpperCase()}</strong> của bạn đã được xác nhận.</p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:13px;color:#6b7280;">Sản phẩm</th>
            <th style="padding:8px 12px;text-align:center;font-size:13px;color:#6b7280;">SL</th>
            <th style="padding:8px 12px;text-align:right;font-size:13px;color:#6b7280;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;text-align:right;font-weight:600;color:#111827;">Tổng cộng:</td>
            <td style="padding:12px;text-align:right;font-weight:700;color:#e53e3e;font-size:16px;">${totalPrice.toLocaleString('vi-VN')}₫</td>
          </tr>
        </tfoot>
      </table>

      ${downloadSection}

      <p style="margin-top:24px;color:#6b7280;font-size:13px;">
        Nếu bạn có câu hỏi, hãy liên hệ với chúng tôi.<br/>
        Cảm ơn bạn đã mua sắm tại <strong>Project Selling</strong>!
      </p>
    </div>
  </div>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API – send an order-confirmation email with download links
// ---------------------------------------------------------------------------
export async function sendOrderConfirmationEmail(options: SendOrderEmailOptions): Promise<void> {
  const transporter = createTransporter()

  if (!transporter) {
    // GMAIL_USER / GMAIL_PASS not configured – skip silently in dev/test
    console.warn('[email] GMAIL_USER or GMAIL_PASS not configured – skipping order confirmation email')
    return
  }

  const { to, customerName, orderId, items, totalPrice } = options

  const html = buildOrderEmailHtml(customerName || to, orderId, items, totalPrice)

  try {
    const info = await transporter.sendMail({
      from: `"Project Selling" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Tải sản phẩm của bạn',
      html,
    })
    console.log('[email] Order confirmation sent successfully:', info.messageId)
  } catch (error) {
    // Log but do NOT rethrow – a failed email must never block an order
    console.error('[email] Failed to send order confirmation email:', error)
    throw error  // re-throw so the caller can decide to log/ignore
  }
}
