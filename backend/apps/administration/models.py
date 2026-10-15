from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    """
    Immutable audit trail recording sensitive administrative events,
    moderation decisions, account suspensions, and platform governance changes.
    """
    class Action(models.TextChoices):
        USER_SUSPENDED = 'USER_SUSPENDED', 'User Suspended'
        USER_REACTIVATED = 'USER_REACTIVATED', 'User Reactivated'
        WORKER_VERIFIED = 'WORKER_VERIFIED', 'Worker Verified'
        WORKER_UNVERIFIED = 'WORKER_UNVERIFIED', 'Worker Verification Revoked'
        CATEGORY_CREATED = 'CATEGORY_CREATED', 'Service Category Created'
        CATEGORY_UPDATED = 'CATEGORY_UPDATED', 'Service Category Updated'
        CATEGORY_DELETED = 'CATEGORY_DELETED', 'Service Category Deleted'
        REVIEW_MODERATED = 'REVIEW_MODERATED', 'Review Moderated'
        DISPUTE_UPDATED = 'DISPUTE_UPDATED', 'Booking Dispute Updated'

    id = models.BigAutoField(primary_key=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='admin_audit_logs'
    )
    action = models.CharField(max_length=64, choices=Action.choices, db_index=True)
    resource_type = models.CharField(max_length=64, db_index=True, help_text="e.g. user, worker, category, booking, review")
    resource_id = models.CharField(max_length=128, db_index=True)
    description = models.TextField(blank=True)
    payload = models.JSONField(default=dict, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'admin_audit_logs'
        ordering = ['-created_at']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        actor_email = self.actor.email if self.actor else "System/Unknown"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {self.action} by {actor_email} on {self.resource_type}:{self.resource_id}"


def log_admin_event(actor, action, resource_type, resource_id, description="", payload=None, request=None):
    """
    Central helper to record an immutable administrative audit event.
    Safely captures caller's IP address.
    """
    ip = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

    return AuditLog.objects.create(
        actor=actor if (actor and actor.is_authenticated) else None,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        description=description,
        payload=payload or {},
        ip_address=ip
    )
