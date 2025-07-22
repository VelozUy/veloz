// Notification System for Client Project Tracking
// Handles automated notifications and alerts for project progress

import { getFirestoreService } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { emailService } from '@/services/email';

export interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  milestoneReminders: boolean;
  deadlineAlerts: boolean;
  urgentUpdates: boolean;
}

export interface NotificationTemplate {
  id: string;
  type: 'milestone_update' | 'deadline_alert' | 'status_change' | 'file_upload' | 'reminder';
  subject: string;
  message: string;
  emailTemplate?: string;
  smsTemplate?: string;
  inAppTemplate?: string;
}

export interface Notification {
  id: string;
  projectId: string;
  type: 'milestone_update' | 'deadline_alert' | 'status_change' | 'file_upload' | 'reminder' | 'urgent';
  title: string;
  message: string;
  recipient: string;
  recipientType: 'client' | 'admin' | 'team';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  sent: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  metadata?: {
    milestoneId?: string;
    fileId?: string;
    status?: string;
    deadline?: Date;
  };
}

export class NotificationService {
  private templates: NotificationTemplate[] = [
    {
      id: 'milestone_completed',
      type: 'milestone_update',
      subject: 'Milestone Completed - {projectTitle}',
      message: 'Great news! The milestone "{milestoneName}" has been completed for your project.',
      emailTemplate: `
        <h2>Milestone Completed</h2>
        <p>Hello {clientName},</p>
        <p>Great news! The milestone <strong>{milestoneName}</strong> has been completed for your project <strong>{projectTitle}</strong>.</p>
        <p>This brings your project progress to {progressPercentage}%.</p>
        <p>Next milestone: {nextMilestone}</p>
        <p>Best regards,<br>The Veloz Team</p>
      `,
      smsTemplate: 'Milestone "{milestoneName}" completed for {projectTitle}. Progress: {progressPercentage}%.',
      inAppTemplate: 'Milestone "{milestoneName}" completed. Progress: {progressPercentage}%.'
    },
    {
      id: 'deadline_approaching',
      type: 'deadline_alert',
      subject: 'Deadline Approaching - {projectTitle}',
      message: 'Reminder: The deadline for "{milestoneName}" is approaching.',
      emailTemplate: `
        <h2>Deadline Approaching</h2>
        <p>Hello {clientName},</p>
        <p>This is a friendly reminder that the deadline for <strong>{milestoneName}</strong> is approaching.</p>
        <p>Deadline: {deadline}</p>
        <p>Current status: {status}</p>
        <p>Please let us know if you have any questions or need to adjust the timeline.</p>
        <p>Best regards,<br>The Veloz Team</p>
      `,
      smsTemplate: 'Deadline approaching for {milestoneName} in {projectTitle}. Due: {deadline}.',
      inAppTemplate: 'Deadline approaching for "{milestoneName}". Due: {deadline}.'
    },
    {
      id: 'status_change',
      type: 'status_change',
      subject: 'Project Status Updated - {projectTitle}',
      message: 'Your project status has been updated to "{newStatus}".',
      emailTemplate: `
        <h2>Project Status Updated</h2>
        <p>Hello {clientName},</p>
        <p>Your project <strong>{projectTitle}</strong> status has been updated to <strong>{newStatus}</strong>.</p>
        <p>Current progress: {progressPercentage}%</p>
        <p>Next steps: {nextSteps}</p>
        <p>Best regards,<br>The Veloz Team</p>
      `,
      smsTemplate: 'Project {projectTitle} status updated to {newStatus}. Progress: {progressPercentage}%.',
      inAppTemplate: 'Project status updated to "{newStatus}". Progress: {progressPercentage}%.'
    },
    {
      id: 'file_uploaded',
      type: 'file_upload',
      subject: 'New Files Available - {projectTitle}',
      message: 'New files have been uploaded for your project.',
      emailTemplate: `
        <h2>New Files Available</h2>
        <p>Hello {clientName},</p>
        <p>New files have been uploaded for your project <strong>{projectTitle}</strong>.</p>
        <p>Files uploaded:</p>
        <ul>{fileList}</ul>
        <p>You can download these files from your project dashboard.</p>
        <p>Best regards,<br>The Veloz Team</p>
      `,
      smsTemplate: 'New files uploaded for {projectTitle}: {fileCount} files available.',
      inAppTemplate: 'New files uploaded: {fileCount} files available.'
    },
    {
      id: 'urgent_update',
      type: 'reminder',
      subject: 'URGENT: {projectTitle} - Action Required',
      message: 'Urgent update regarding your project that requires immediate attention.',
      emailTemplate: `
        <h2>URGENT: Action Required</h2>
        <p>Hello {clientName},</p>
        <p>This is an urgent update regarding your project <strong>{projectTitle}</strong>.</p>
        <p><strong>{urgentMessage}</strong></p>
        <p>Please respond as soon as possible to avoid delays.</p>
        <p>Best regards,<br>The Veloz Team</p>
      `,
      smsTemplate: 'URGENT: {urgentMessage} for {projectTitle}. Please respond immediately.',
      inAppTemplate: 'URGENT: {urgentMessage} - Action required immediately.'
    }
  ];

  /**
   * Create a new notification
   */
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'sent'>): Promise<string> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        read: false,
        sent: false,
        createdAt: serverTimestamp(),
      });

      return notificationRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Send notification via email
   */
  async sendEmailNotification(notification: Notification, template: NotificationTemplate, data: Record<string, string>): Promise<boolean> {
    try {
      const subject = this.replaceTemplateVariables(template.subject, data);
      const message = this.replaceTemplateVariables(template.emailTemplate || template.message, data);

      // TODO: Implement proper email sending using emailService
      // For now, log the email details
      console.log('Email Notification:', {
        to: notification.recipient,
        subject,
        message,
      });

      // Mark notification as sent
      await this.markNotificationAsSent(notification.id);
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  /**
   * Send notification via SMS (placeholder for SMS service integration)
   */
  async sendSMSNotification(notification: Notification, template: NotificationTemplate, data: Record<string, string>): Promise<boolean> {
    try {
      const message = this.replaceTemplateVariables(template.smsTemplate || template.message, data);
      
      // TODO: Integrate with SMS service (Twilio, etc.)
      console.log('SMS Notification:', {
        to: notification.recipient,
        message,
      });

      await this.markNotificationAsSent(notification.id);
      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  /**
   * Get notifications for a project
   */
  async getProjectNotifications(projectId: string): Promise<Notification[]> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(notificationsQuery);
      const notifications: Notification[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          sentAt: data.sentAt?.toDate(),
          scheduledFor: data.scheduledFor?.toDate(),
        } as Notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark notification as sent
   */
  async markNotificationAsSent(notificationId: string): Promise<void> {
    try {
      const db = await getFirestoreService();
      if (!db) throw new Error('Firestore not available');

      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        sent: true,
        sentAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking notification as sent:', error);
      throw new Error('Failed to mark notification as sent');
    }
  }

  /**
   * Create milestone completion notification
   */
  async createMilestoneNotification(
    projectId: string,
    milestoneName: string,
    clientEmail: string,
    clientName: string,
    projectTitle: string,
    progressPercentage: number,
    nextMilestone?: string
  ): Promise<string> {
    const template = this.templates.find(t => t.id === 'milestone_completed');
    if (!template) throw new Error('Template not found');

    const notificationId = await this.createNotification({
      projectId,
      type: 'milestone_update',
      title: `Milestone Completed: ${milestoneName}`,
      message: `The milestone "${milestoneName}" has been completed for your project.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'medium',
      metadata: {
        milestoneId: milestoneName,
      },
    });

    // Create notification object for email sending
    const notification: Notification = {
      id: notificationId,
      projectId,
      type: 'milestone_update',
      title: `Milestone Completed: ${milestoneName}`,
      message: `The milestone "${milestoneName}" has been completed for your project.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'medium',
      read: false,
      sent: false,
      createdAt: new Date(),
      metadata: {
        milestoneId: milestoneName,
      },
    };

    // Send email notification
    const data = {
      clientName,
      projectTitle,
      milestoneName,
      progressPercentage: `${progressPercentage}%`,
      nextMilestone: nextMilestone || 'Final delivery',
    };

    await this.sendEmailNotification(notification, template, data);

    return notificationId;
  }

  /**
   * Create deadline alert notification
   */
  async createDeadlineAlert(
    projectId: string,
    milestoneName: string,
    deadline: Date,
    clientEmail: string,
    clientName: string,
    projectTitle: string,
    status: string
  ): Promise<string> {
    const template = this.templates.find(t => t.id === 'deadline_approaching');
    if (!template) throw new Error('Template not found');

    const notificationId = await this.createNotification({
      projectId,
      type: 'deadline_alert',
      title: `Deadline Approaching: ${milestoneName}`,
      message: `Reminder: The deadline for "${milestoneName}" is approaching.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'high',
      metadata: {
        milestoneId: milestoneName,
        deadline,
        status,
      },
    });

    // Create notification object for email sending
    const notification: Notification = {
      id: notificationId,
      projectId,
      type: 'deadline_alert',
      title: `Deadline Approaching: ${milestoneName}`,
      message: `Reminder: The deadline for "${milestoneName}" is approaching.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'high',
      read: false,
      sent: false,
      createdAt: new Date(),
      metadata: {
        milestoneId: milestoneName,
        deadline,
        status,
      },
    };

    // Send email notification
    const data = {
      clientName,
      projectTitle,
      milestoneName,
      deadline: deadline.toLocaleDateString(),
      status,
    };

    await this.sendEmailNotification(notification, template, data);

    return notificationId;
  }

  /**
   * Create status change notification
   */
  async createStatusChangeNotification(
    projectId: string,
    newStatus: string,
    clientEmail: string,
    clientName: string,
    projectTitle: string,
    progressPercentage: number,
    nextSteps: string
  ): Promise<string> {
    const template = this.templates.find(t => t.id === 'status_change');
    if (!template) throw new Error('Template not found');

    const notificationId = await this.createNotification({
      projectId,
      type: 'status_change',
      title: `Project Status Updated: ${newStatus}`,
      message: `Your project status has been updated to "${newStatus}".`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'medium',
      metadata: {
        status: newStatus,
      },
    });

    // Create notification object for email sending
    const notification: Notification = {
      id: notificationId,
      projectId,
      type: 'status_change',
      title: `Project Status Updated: ${newStatus}`,
      message: `Your project status has been updated to "${newStatus}".`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'medium',
      read: false,
      sent: false,
      createdAt: new Date(),
      metadata: {
        status: newStatus,
      },
    };

    // Send email notification
    const data = {
      clientName,
      projectTitle,
      newStatus,
      progressPercentage: `${progressPercentage}%`,
      nextSteps,
    };

    await this.sendEmailNotification(notification, template, data);

    return notificationId;
  }

  /**
   * Create file upload notification
   */
  async createFileUploadNotification(
    projectId: string,
    fileCount: number,
    fileNames: string[],
    clientEmail: string,
    clientName: string,
    projectTitle: string
  ): Promise<string> {
    const template = this.templates.find(t => t.id === 'file_uploaded');
    if (!template) throw new Error('Template not found');

    const notificationId = await this.createNotification({
      projectId,
      type: 'file_upload',
      title: `New Files Available`,
      message: `New files have been uploaded for your project.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'low',
      metadata: {
        fileId: fileNames.join(','),
      },
    });

    // Create notification object for email sending
    const notification: Notification = {
      id: notificationId,
      projectId,
      type: 'file_upload',
      title: `New Files Available`,
      message: `New files have been uploaded for your project.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'low',
      read: false,
      sent: false,
      createdAt: new Date(),
      metadata: {
        fileId: fileNames.join(','),
      },
    };

    // Send email notification
    const fileList = fileNames.map(name => `<li>${name}</li>`).join('');
    const data = {
      clientName,
      projectTitle,
      fileCount: fileCount.toString(),
      fileList,
    };

    await this.sendEmailNotification(notification, template, data);

    return notificationId;
  }

  /**
   * Create urgent notification
   */
  async createUrgentNotification(
    projectId: string,
    urgentMessage: string,
    clientEmail: string,
    clientName: string,
    projectTitle: string
  ): Promise<string> {
    const template = this.templates.find(t => t.id === 'urgent_update');
    if (!template) throw new Error('Template not found');

    const notificationId = await this.createNotification({
      projectId,
      type: 'reminder',
      title: `URGENT: Action Required`,
      message: `Urgent update regarding your project that requires immediate attention.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'urgent',
    });

    // Create notification object for email sending
    const notification: Notification = {
      id: notificationId,
      projectId,
      type: 'reminder',
      title: `URGENT: Action Required`,
      message: `Urgent update regarding your project that requires immediate attention.`,
      recipient: clientEmail,
      recipientType: 'client',
      priority: 'urgent',
      read: false,
      sent: false,
      createdAt: new Date(),
    };

    // Send email notification
    const data = {
      clientName,
      projectTitle,
      urgentMessage,
    };

    await this.sendEmailNotification(notification, template, data);

    return notificationId;
  }

  /**
   * Replace template variables with actual data
   */
  private replaceTemplateVariables(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Get notification templates
   */
  getTemplates(): NotificationTemplate[] {
    return this.templates;
  }

  /**
   * Add custom notification template
   */
  addTemplate(template: NotificationTemplate): void {
    this.templates.push(template);
  }
}

// Export singleton instance
export const notificationService = new NotificationService(); 