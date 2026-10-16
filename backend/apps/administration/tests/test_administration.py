from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.workers.models import WorkerProfile
from apps.services.models import ServiceCategory
from apps.bookings.models import Booking
from apps.reviews.models import Review
from apps.administration.models import AuditLog

class SecureAdministrationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Superuser / Platform Administrator
        self.admin_user = User.objects.create_superuser(
            email='admin@tegagn.com',
            password='AdminPassword123!',
            first_name='Platform',
            last_name='Director',
            phone_number='+251911000000',
            role=User.Role.ADMIN
        )

        # 2. Regular Customer
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='CustomerPassword123!',
            first_name='Liya',
            last_name='Kebede',
            phone_number='+251911112233',
            role=User.Role.CUSTOMER
        )

        # 3. Regular Worker & Profile
        self.category = ServiceCategory.objects.create(
            slug='electrical',
            name='Electrical Services',
            trade_key='electrician',
            description='Home wiring and circuit repair',
            icon_name='Zap'
        )

        self.worker_user = User.objects.create_user(
            email='electrician@example.com',
            password='WorkerPassword123!',
            first_name='Dawit',
            last_name='Tadesse',
            phone_number='+251922334455',
            role=User.Role.WORKER
        )
        self.worker_profile = WorkerProfile.objects.create(
            user=self.worker_user,
            primary_category=self.category,
            trade_title='Licensed Master Electrician',
            bio='10 years experience in residential and commercial electrical systems.',
            hourly_rate=75.00,
            experience_years=10,
            is_verified=False
        )

        # 4. Completed Booking & Review
        self.booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title='Main Breaker Replacement',
            status=Booking.Status.COMPLETED,
            scheduled_date=(timezone.now() - timedelta(days=2)).date(),
            scheduled_time_slot='09:00 AM - 12:00 PM',
            service_address='Bole, Addis Ababa',
            agreed_price=150.00
        )
        self.review = Review.objects.create(
            booking=self.booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment='Outstanding electrical service and very punctual.',
            is_public=True
        )

    # -------------------------------------------------------------------------
    # Authorization & Permission Tests
    # -------------------------------------------------------------------------

    def test_unauthenticated_requests_denied(self):
        """Unauthenticated requests to admin endpoints return 401 Unauthorized."""
        endpoints = [
            reverse('administration:admin-user-list'),
            reverse('administration:admin-worker-list'),
            reverse('administration:admin-stats'),
            reverse('administration:admin-audit-logs'),
        ]
        for url in endpoints:
            response = self.client.get(url)
            self.assertEqual(
                response.status_code, 
                status.HTTP_401_UNAUTHORIZED, 
                f"Failed for unauthenticated request to {url}"
            )

    def test_customer_cannot_access_admin_endpoints(self):
        """Customer token receives 403 Forbidden on administrative endpoints."""
        self.client.force_authenticate(user=self.customer)
        endpoints = [
            reverse('administration:admin-user-list'),
            reverse('administration:admin-worker-list'),
            reverse('administration:admin-category-list-create'),
            reverse('administration:admin-booking-list'),
            reverse('administration:admin-review-list'),
            reverse('administration:admin-stats'),
            reverse('administration:admin-audit-logs'),
        ]
        for url in endpoints:
            response = self.client.get(url)
            self.assertEqual(
                response.status_code, 
                status.HTTP_403_FORBIDDEN, 
                f"Customer was not blocked from {url}"
            )

    def test_worker_cannot_access_admin_endpoints(self):
        """Worker token receives 403 Forbidden on administrative endpoints."""
        self.client.force_authenticate(user=self.worker_user)
        response = self.client.get(reverse('administration:admin-stats'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_frontend_supplied_role_cannot_spoof_admin(self):
        """
        Submitting custom headers or body claiming role='admin' from non-admin accounts
        is strictly ignored; only verified database attributes are honored.
        """
        self.client.force_authenticate(user=self.customer)
        url = reverse('administration:admin-stats')
        response = self.client.get(
            url, 
            HTTP_X_USER_ROLE='admin', 
            data={'role': 'admin'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_promote_self_to_admin(self):
        """Customers cannot promote their own account role via profile updates."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('accounts:user-profile')
        payload = {
            'first_name': 'Hacked',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.customer.refresh_from_db()
        self.assertEqual(self.customer.role, User.Role.CUSTOMER)
        self.assertFalse(self.customer.is_staff)
        self.assertFalse(self.customer.is_superuser)

    # -------------------------------------------------------------------------
    # User Management & Account Suspension Tests
    # -------------------------------------------------------------------------

    def test_admin_can_list_users_and_passwords_are_not_exposed(self):
        """Admin can list platform users with pagination; passwords and tokens are never exposed."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('results', response.data)

        # Verify no sensitive password/hash exposed
        first_user = response.data['results'][0]
        self.assertNotIn('password', first_user)
        self.assertNotIn('token', first_user)
        self.assertIn('email', first_user)
        self.assertIn('role', first_user)

    def test_admin_can_suspend_and_reactivate_user(self):
        """Admin can suspend and reactivate user accounts with audit logging."""
        self.client.force_authenticate(user=self.admin_user)
        status_url = reverse('administration:admin-user-status', kwargs={'pk': self.customer.id})

        # Suspend customer account
        res_suspend = self.client.post(status_url, {
            'is_active': False,
            'reason': 'Multiple terms of service violations.'
        }, format='json')
        self.assertEqual(res_suspend.status_code, status.HTTP_200_OK)

        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)

        # Verify audit log entry created
        audit_entry = AuditLog.objects.filter(
            action=AuditLog.Action.USER_SUSPENDED,
            resource_id=str(self.customer.id)
        ).first()
        self.assertIsNotNone(audit_entry)
        self.assertEqual(audit_entry.actor, self.admin_user)
        self.assertIn('Multiple terms', audit_entry.description)

        # Reactivate customer account
        res_reactivate = self.client.post(status_url, {
            'is_active': True,
            'reason': 'Account restored following appeal review.'
        }, format='json')
        self.assertEqual(res_reactivate.status_code, status.HTTP_200_OK)

        self.customer.refresh_from_db()
        self.assertTrue(self.customer.is_active)

    def test_admin_cannot_suspend_themselves(self):
        """Admins are prevented from accidentally suspending their own account."""
        self.client.force_authenticate(user=self.admin_user)
        status_url = reverse('administration:admin-user-status', kwargs={'pk': self.admin_user.id})
        response = self.client.post(status_url, {'is_active': False}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot suspend their own account', str(response.data))

    # -------------------------------------------------------------------------
    # Worker Verification Management Tests
    # -------------------------------------------------------------------------

    def test_admin_can_verify_and_unverify_worker(self):
        """Admin can review credentials, grant verified status, and revoke verification."""
        self.client.force_authenticate(user=self.admin_user)
        verify_url = reverse('administration:admin-worker-verify', kwargs={'pk': self.worker_profile.id})

        # Grant verification
        res_verify = self.client.post(verify_url, {
            'is_verified': True,
            'notes': 'Government ID and master electrician license verified.'
        }, format='json')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)

        self.worker_profile.refresh_from_db()
        self.assertTrue(self.worker_profile.is_verified)
        self.assertIsNotNone(self.worker_profile.verified_at)

        # Revoke verification
        res_revoke = self.client.post(verify_url, {
            'is_verified': False,
            'notes': 'License expired.'
        }, format='json')
        self.assertEqual(res_revoke.status_code, status.HTTP_200_OK)

        self.worker_profile.refresh_from_db()
        self.assertFalse(self.worker_profile.is_verified)
        self.assertIsNone(self.worker_profile.verified_at)

    # -------------------------------------------------------------------------
    # Service Category Management Tests
    # -------------------------------------------------------------------------

    def test_admin_service_category_crud_operations(self):
        """Admin can create, update, and remove service categories with audit logging."""
        self.client.force_authenticate(user=self.admin_user)
        list_create_url = reverse('administration:admin-category-list-create')

        # 1. Create Category
        new_category_payload = {
            'slug': 'painting',
            'name': 'Painting & Wall Finishing',
            'trade_key': 'painter',
            'description': 'Interior and exterior painting services',
            'icon_name': 'Paintbrush',
            'is_active': True,
            'display_order': 4
        }
        res_create = self.client.post(list_create_url, new_category_payload, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ServiceCategory.objects.filter(slug='painting').exists())

        # Check audit log for category creation
        self.assertTrue(AuditLog.objects.filter(action=AuditLog.Action.CATEGORY_CREATED).exists())

        # 2. Update Category
        detail_url = reverse('administration:admin-category-detail', kwargs={'slug': 'painting'})
        res_update = self.client.patch(detail_url, {'name': 'Professional Painting'}, format='json')
        self.assertEqual(res_update.status_code, status.HTTP_200_OK)
        self.assertEqual(ServiceCategory.objects.get(slug='painting').name, 'Professional Painting')

        # 3. Delete Category
        res_delete = self.client.delete(detail_url)
        self.assertEqual(res_delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ServiceCategory.objects.filter(slug='painting').exists())
        self.assertTrue(AuditLog.objects.filter(action=AuditLog.Action.CATEGORY_DELETED).exists())

    # -------------------------------------------------------------------------
    # Booking Overview & Review Moderation Tests
    # -------------------------------------------------------------------------

    def test_admin_can_view_bookings_and_filter(self):
        """Admin can view all platform bookings and filter by status."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-booking-list')
        response = self.client.get(f"{url}?status=completed")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['status'], 'completed')

    def test_admin_review_moderation_hides_review_and_updates_worker_rating(self):
        """Moderating a review to hide it recalculates the worker profile metrics."""
        self.client.force_authenticate(user=self.admin_user)
        mod_url = reverse('administration:admin-review-moderate', kwargs={'pk': self.review.id})

        # Initial worker rating is 5.0 with 1 review
        self.worker_profile.refresh_from_db()
        self.assertEqual(float(self.worker_profile.rating_average), 5.0)
        self.assertEqual(self.worker_profile.reviews_count, 1)

        # Admin hides review
        res_hide = self.client.post(mod_url, {
            'is_public': False,
            'reason': 'Review contained inappropriate language.'
        }, format='json')
        self.assertEqual(res_hide.status_code, status.HTTP_200_OK)

        self.review.refresh_from_db()
        self.assertFalse(self.review.is_public)

        # Worker profile rating should automatically exclude the hidden review
        self.worker_profile.refresh_from_db()
        self.assertEqual(float(self.worker_profile.rating_average), 0.0)
        self.assertEqual(self.worker_profile.reviews_count, 0)

        # Check audit log
        self.assertTrue(AuditLog.objects.filter(action=AuditLog.Action.REVIEW_MODERATED).exists())

    # -------------------------------------------------------------------------
    # Platform Statistics & Audit Trail Tests
    # -------------------------------------------------------------------------

    def test_admin_platform_stats(self):
        """Admin platform statistics returns computed platform metrics and revenue volume."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['total_customers'], 1)
        self.assertEqual(data['total_workers'], 1)
        self.assertEqual(data['total_bookings'], 1)
        self.assertEqual(data['completed_bookings'], 1)
        self.assertEqual(float(data['total_volume']), 150.00)

    def test_admin_audit_logs_listing_and_filtering(self):
        """Admin can list and filter audit trail records."""
        # Create an audit event
        AuditLog.objects.create(
            actor=self.admin_user,
            action=AuditLog.Action.USER_SUSPENDED,
            resource_type='user',
            resource_id=str(self.customer.id),
            description='Test audit event'
        )

        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-audit-logs')
        response = self.client.get(f"{url}?action=USER_SUSPENDED")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['action'], 'USER_SUSPENDED')

    def test_admin_can_mediate_and_cap_excessive_price(self):
        """Administrator can intervene and cap an excessive booking price."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-booking-mediate-price', kwargs={'pk': self.booking.id})
        payload = {
            'action': 'cap_price',
            'new_price': '85.00',
            'reason': 'Excessive fee mediation. Price capped to fair category benchmark.',
            'regulatory_note': 'Warning communicated to worker.'
        }
        response = self.client.post(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.booking.refresh_from_db()
        self.assertEqual(float(self.booking.agreed_price), 85.00)

        # Verify audit log was created
        log = AuditLog.objects.filter(action=AuditLog.Action.PRICE_ADJUSTED, resource_id=str(self.booking.id)).first()
        self.assertIsNotNone(log)
        self.assertIn('85.00', log.description)

    def test_non_admin_cannot_mediate_price(self):
        """Customers or unauthorized users cannot mediate booking prices."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('administration:admin-booking-mediate-price', kwargs={'pk': self.booking.id})
        response = self.client.post(url, data={'action': 'cap_price', 'new_price': '50.00', 'reason': 'Test'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_issue_regulatory_price_warning(self):
        """Administrator can issue formal price gouging warning to a worker."""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('administration:admin-booking-mediate-price', kwargs={'pk': self.booking.id})
        payload = {
            'action': 'warn_worker',
            'reason': 'Worker quoted fee 4x above platform baseline.',
            'regulatory_note': 'First formal warning. Recurrence will trigger suspension.'
        }
        response = self.client.post(url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        log = AuditLog.objects.filter(action=AuditLog.Action.WARNING_ISSUED, resource_id=str(self.booking.worker.id)).first()
        self.assertIsNotNone(log)
        self.assertIn('First formal warning', log.payload.get('note', ''))
