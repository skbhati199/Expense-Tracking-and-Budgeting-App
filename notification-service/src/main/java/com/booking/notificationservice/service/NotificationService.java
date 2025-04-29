package com.booking.notificationservice.service;

/**
 * Service interface for sending notifications to users.
 */
public interface NotificationService {
    
    /**
     * Sends a notification to a user.
     * 
     * @param userId the ID of the user to send the notification to
     * @param title the title of the notification
     * @param content the content of the notification
     * @param type the type of notification (e.g., BUDGET_ALERT, EXPENSE_CREATED)
     * @return true if the notification was sent successfully, false otherwise
     */
    boolean sendNotification(String userId, String title, String content, String type);
    
    /**
     * Sends an email notification to a user.
     * 
     * @param email the email address to send the notification to
     * @param subject the subject of the email
     * @param body the body of the email
     * @return true if the email was sent successfully, false otherwise
     */
    boolean sendEmailNotification(String email, String subject, String body);
    
    /**
     * Sends a push notification to a user's device.
     * 
     * @param userId the ID of the user to send the notification to
     * @param title the title of the notification
     * @param message the message of the notification
     * @param data additional data to include with the notification
     * @return true if the push notification was sent successfully, false otherwise
     */
    boolean sendPushNotification(String userId, String title, String message, Object data);
}