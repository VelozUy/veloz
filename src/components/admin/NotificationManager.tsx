// Notification Manager Component for Admin Project Management
// Provides controls for managing notifications and automated alerts

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Send,
  Trash2
} from 'lucide-react';
import { notificationService, Notification, NotificationPreferences } from '@/lib/notifications';

interface NotificationManagerProps {
  projectId: string;
  clientEmail: string;
  clientName: string;
  projectTitle: string;
}

export default function NotificationManager({
  projectId,
  clientEmail,
  clientName,
  projectTitle,
}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    milestoneReminders: true,
    deadlineAlerts: true,
    urgentUpdates: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, [projectId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const projectNotifications = await notificationService.getProjectNotifications(projectId);
      setNotifications(projectNotifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async (type: 'milestone' | 'deadline' | 'status' | 'file' | 'urgent') => {
    try {
      setLoading(true);
      setError('');

      switch (type) {
        case 'milestone':
          await notificationService.createMilestoneNotification(
            projectId,
            'Test Milestone',
            clientEmail,
            clientName,
            projectTitle,
            75,
            'Final Delivery'
          );
          break;
        case 'deadline':
          await notificationService.createDeadlineAlert(
            projectId,
            'Test Deadline',
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            clientEmail,
            clientName,
            projectTitle,
            'In Progress'
          );
          break;
        case 'status':
          await notificationService.createStatusChangeNotification(
            projectId,
            'In Progress',
            clientEmail,
            clientName,
            projectTitle,
            60,
            'Continue with current phase'
          );
          break;
        case 'file':
          await notificationService.createFileUploadNotification(
            projectId,
            3,
            ['photo1.jpg', 'photo2.jpg', 'video1.mp4'],
            clientEmail,
            clientName,
            projectTitle
          );
          break;
        case 'urgent':
          await notificationService.createUrgentNotification(
            projectId,
            'Test urgent message requiring immediate attention',
            clientEmail,
            clientName,
            projectTitle
          );
          break;
      }

      // Reload notifications
      await loadNotifications();
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError('Error sending test notification');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error marking notification as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: Implement delete notification functionality
      console.log('Delete notification:', notificationId);
      await loadNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Error deleting notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'milestone_update':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'deadline_alert':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'status_change':
        return <Settings className="w-4 h-4 text-primary" />;
      case 'file_upload':
        return <Mail className="w-4 h-4 text-primary" />;
      case 'reminder':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive';
      case 'high':
        return 'bg-primary/10 text-primary';
      case 'medium':
        return 'bg-primary/10 text-primary';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, emailNotifications: !!checked }))
                }
              />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotifications"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, smsNotifications: !!checked }))
                }
              />
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inAppNotifications"
                checked={preferences.inAppNotifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, inAppNotifications: !!checked }))
                }
              />
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="milestoneReminders"
                checked={preferences.milestoneReminders}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, milestoneReminders: !!checked }))
                }
              />
              <Label htmlFor="milestoneReminders">Milestone Reminders</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="deadlineAlerts"
                checked={preferences.deadlineAlerts}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, deadlineAlerts: !!checked }))
                }
              />
              <Label htmlFor="deadlineAlerts">Deadline Alerts</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgentUpdates"
                checked={preferences.urgentUpdates}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, urgentUpdates: !!checked }))
                }
              />
              <Label htmlFor="urgentUpdates">Urgent Updates</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendTestNotification('milestone')}
              disabled={loading}
            >
              Test Milestone
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendTestNotification('deadline')}
              disabled={loading}
            >
              Test Deadline
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendTestNotification('status')}
              disabled={loading}
            >
              Test Status
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendTestNotification('file')}
              disabled={loading}
            >
              Test File Upload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => sendTestNotification('urgent')}
              disabled={loading}
            >
              Test Urgent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification History
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading notifications...</div>
          ) : error ? (
            <div className="text-destructive py-4">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    !notification.read ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.createdAt.toLocaleDateString()} at{' '}
                        {notification.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 