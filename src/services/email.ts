
export interface EmailConfig {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export const emailService = {
  async sendEmail(config: EmailConfig) {
    console.log(`[Email Service] Sending email to ${config.to} with subject: ${config.subject}`);
    // In a real app, this would call your backend or an email service API like Resend, SendGrid, or EmailJS
    // For now, we simulate the network request
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { message: text || 'Invalid JSON response' };
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  },

  async sendSignupWelcome(userEmail: string, userName: string, role: string) {
    // To Customer/Designer
    await this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Crownstroke!',
      template: 'welcome',
      data: { name: userName, role }
    });

    // To Admin
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@crownstroke.com';
    await this.sendEmail({
      to: adminEmail,
      subject: 'New User Signup',
      template: 'admin_notification',
      data: { userEmail, userName, role }
    });
  },

  async sendPasswordReset(email: string, name: string, resetLink: string) {
    await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password_reset',
      data: { name, resetLink }
    });
  },

  async sendOrderConfirmation(order: any) {
    // 1. To Customer
    await this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id.slice(0, 8)}`,
      template: 'order_confirmation',
      data: order
    });

    // 2. To Admin
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@crownstroke.com';
    await this.sendEmail({
      to: adminEmail,
      subject: `New Order Received #${order.id.slice(0, 8)}`,
      template: 'admin_order_notification',
      data: order
    });

    // 3. To Designers (each designer who has an item in the order)
    const designerEmails = new Set<string>();
    const items = order.items as any[];
    
    // In a real app, you'd fetch designer emails from the DB based on designerId
    // For now we assume items have designer metadata or we'd fetch them
    items.forEach(item => {
      if (item.designerEmail) {
        designerEmails.add(item.designerEmail);
      }
    });

    for (const email of designerEmails) {
      await this.sendEmail({
        to: email,
        subject: `New Sale Notification! Order #${order.id.slice(0, 8)}`,
        template: 'designer_order_notification',
        data: {
          orderId: order.id,
          items: items.filter(i => i.designerEmail === email)
        }
      });
    }
  }
};
