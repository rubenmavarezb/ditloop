# TASK: Push Notification Service

## Goal
Implement PushNotificationService using Web Push API with VAPID keys for sending notifications about approvals, executions, and messages.

## Scope

### Allowed
- packages/server/src/notifications/push-notification-service.ts
- packages/server/src/notifications/push-notification-service.test.ts

### Forbidden
- packages/core/**
- packages/mobile/**

## Requirements
1. Web Push API integration with VAPID keys
2. Subscription management (register, unregister, list)
3. Notification types: approval-requested, execution-completed, execution-failed, session-message
4. Payload includes title, body, icon, action URL
5. Rate limiting (max 10 notifications/min per device)
6. Failed delivery retry with exponential backoff

## Definition of Done
- [ ] Push service sends notifications
- [ ] Subscription CRUD working
- [ ] All notification types supported
- [ ] Rate limiting enforced
- [ ] Unit tests for all notification types

## Status: 📋 Planned
