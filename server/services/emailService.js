import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Create transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production email configuration (e.g., SendGrid, AWS SES, etc.)
        this.transporter = nodemailer.createTransport({
          service: 'gmail', // or your preferred service
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else {
        // Development configuration using Ethereal Email
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Verify transporter
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async loadTemplate(templateName, variables = {}) {
    try {
      const templatePath = join(__dirname, '../templates/email', `${templateName}.html`);
      let template = await fs.readFile(templatePath, 'utf-8');
      
      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, variables[key]);
      });
      
      return template;
    } catch (error) {
      console.error(`Failed to load email template ${templateName}:`, error);
      return null;
    }
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `"Panchakarma Platform" <${process.env.EMAIL_FROM || 'noreply@panchakarma.com'}>`,
        to,
        subject,
        html,
        text,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
      }
      
      return {
        success: true,
        messageId: result.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(result) : null
      };
    } catch (error) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(user) {
    const template = await this.loadTemplate('welcome', {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Panchakarma Platform',
      html: template || `
        <h1>Welcome to Panchakarma Platform</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Welcome to our Panchakarma platform! Your account has been created successfully.</p>
        <p>Role: ${user.role}</p>
        <p><a href="${process.env.FRONTEND_URL}/login">Login to your account</a></p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Appointment confirmation email
  async sendAppointmentConfirmation(appointment, patient, practitioner) {
    const template = await this.loadTemplate('appointment-confirmation', {
      patientName: `${patient.userId.firstName} ${patient.userId.lastName}`,
      practitionerName: `${practitioner.userId.firstName} ${practitioner.userId.lastName}`,
      appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
      appointmentTime: appointment.startTime,
      appointmentType: appointment.type,
      clinicAddress: practitioner.clinicAddress ? 
        `${practitioner.clinicAddress.street}, ${practitioner.clinicAddress.city}` : 
        'Online Consultation'
    });

    return this.sendEmail({
      to: patient.userId.email,
      subject: 'Appointment Confirmation - Panchakarma Platform',
      html: template || `
        <h1>Appointment Confirmation</h1>
        <p>Dear ${patient.userId.firstName},</p>
        <p>Your appointment has been confirmed:</p>
        <ul>
          <li>Practitioner: Dr. ${practitioner.userId.firstName} ${practitioner.userId.lastName}</li>
          <li>Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime}</li>
          <li>Type: ${appointment.type}</li>
        </ul>
        <p>Please arrive 15 minutes early for your appointment.</p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Appointment reminder email
  async sendAppointmentReminder(appointment, patient, practitioner) {
    const template = await this.loadTemplate('appointment-reminder', {
      patientName: `${patient.userId.firstName} ${patient.userId.lastName}`,
      practitionerName: `${practitioner.userId.firstName} ${practitioner.userId.lastName}`,
      appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString(),
      appointmentTime: appointment.startTime,
      appointmentType: appointment.type
    });

    return this.sendEmail({
      to: patient.userId.email,
      subject: 'Appointment Reminder - Tomorrow',
      html: template || `
        <h1>Appointment Reminder</h1>
        <p>Dear ${patient.userId.firstName},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li>Practitioner: Dr. ${practitioner.userId.firstName} ${practitioner.userId.lastName}</li>
          <li>Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}</li>
          <li>Time: ${appointment.startTime}</li>
          <li>Type: ${appointment.type}</li>
        </ul>
        <p>Please arrive 15 minutes early for your appointment.</p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Practitioner verification email
  async sendVerificationStatusEmail(practitioner, status, notes = '') {
    const isApproved = status === 'approved';
    const template = await this.loadTemplate('verification-status', {
      practitionerName: `${practitioner.userId.firstName} ${practitioner.userId.lastName}`,
      status: status,
      statusMessage: isApproved ? 'approved' : 'rejected',
      notes: notes,
      loginUrl: `${process.env.FRONTEND_URL}/login`
    });

    return this.sendEmail({
      to: practitioner.userId.email,
      subject: `Profile Verification ${isApproved ? 'Approved' : 'Rejected'}`,
      html: template || `
        <h1>Profile Verification ${isApproved ? 'Approved' : 'Rejected'}</h1>
        <p>Dear Dr. ${practitioner.userId.firstName} ${practitioner.userId.lastName},</p>
        <p>Your practitioner profile has been ${status}.</p>
        ${notes ? `<p>Notes: ${notes}</p>` : ''}
        ${isApproved ? 
          '<p>You can now start accepting appointments and managing patients.</p>' : 
          '<p>Please review the feedback and update your profile accordingly.</p>'
        }
        <p><a href="${process.env.FRONTEND_URL}/login">Login to your account</a></p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Invoice email
  async sendInvoiceEmail(invoice, patient, practitioner) {
    const template = await this.loadTemplate('invoice', {
      patientName: `${patient.userId.firstName} ${patient.userId.lastName}`,
      practitionerName: `${practitioner.userId.firstName} ${practitioner.userId.lastName}`,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      totalAmount: invoice.totalAmount,
      paymentUrl: `${process.env.FRONTEND_URL}/invoices/${invoice._id}/pay`
    });

    return this.sendEmail({
      to: patient.userId.email,
      subject: `Invoice ${invoice.invoiceNumber} - Panchakarma Platform`,
      html: template || `
        <h1>Invoice ${invoice.invoiceNumber}</h1>
        <p>Dear ${patient.userId.firstName},</p>
        <p>You have received a new invoice:</p>
        <ul>
          <li>Invoice Number: ${invoice.invoiceNumber}</li>
          <li>Date: ${new Date(invoice.createdAt).toLocaleDateString()}</li>
          <li>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</li>
          <li>Amount: ₹${invoice.totalAmount}</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL}/invoices/${invoice._id}/pay">Pay Now</a></p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const template = await this.loadTemplate('password-reset', {
      firstName: user.firstName,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      expiryTime: '1 hour'
    });

    return this.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Panchakarma Platform',
      html: template || `
        <h1>Password Reset Request</h1>
        <p>Dear ${user.firstName},</p>
        <p>You requested a password reset for your Panchakarma Platform account.</p>
        <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Your Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // Therapy plan email
  async sendTherapyPlanEmail(therapyPlan, patient, practitioner) {
    const template = await this.loadTemplate('therapy-plan', {
      patientName: `${patient.userId.firstName} ${patient.userId.lastName}`,
      practitionerName: `${practitioner.userId.firstName} ${practitioner.userId.lastName}`,
      planTitle: therapyPlan.title,
      planDescription: therapyPlan.description,
      duration: therapyPlan.duration,
      startDate: new Date(therapyPlan.startDate).toLocaleDateString(),
      planUrl: `${process.env.FRONTEND_URL}/therapy-plans/${therapyPlan._id}`
    });

    return this.sendEmail({
      to: patient.userId.email,
      subject: `New Therapy Plan: ${therapyPlan.title}`,
      html: template || `
        <h1>New Therapy Plan Created</h1>
        <p>Dear ${patient.userId.firstName},</p>
        <p>Dr. ${practitioner.userId.firstName} ${practitioner.userId.lastName} has created a new therapy plan for you:</p>
        <ul>
          <li>Title: ${therapyPlan.title}</li>
          <li>Duration: ${therapyPlan.duration} days</li>
          <li>Start Date: ${new Date(therapyPlan.startDate).toLocaleDateString()}</li>
        </ul>
        <p>Description: ${therapyPlan.description}</p>
        <p><a href="${process.env.FRONTEND_URL}/therapy-plans/${therapyPlan._id}">View Therapy Plan</a></p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }

  // System notification email
  async sendSystemNotificationEmail(user, notification) {
    return this.sendEmail({
      to: user.email,
      subject: `${notification.title} - Panchakarma Platform`,
      html: `
        <h1>${notification.title}</h1>
        <p>Dear ${user.firstName},</p>
        <p>${notification.message}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard">Visit Dashboard</a></p>
        <p>Best regards,<br>Panchakarma Team</p>
      `
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;
