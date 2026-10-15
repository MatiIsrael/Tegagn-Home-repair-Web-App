from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.services.models import ServiceCategory
from apps.workers.models import WorkerProfile, WorkerService
from apps.bookings.models import Booking

class BookingEndpointAndPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Category
        self.category = ServiceCategory.objects.create(
            slug='electrical',
            name='Electrical Work',
            trade_key='electrician',
            description='Electrical installations and repairs',
            icon_name='Zap'
        )

        # Customer User
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='Password123!',
            first_name='Martha',
            last_name='Girma',
            phone_number='+251911001122',
            role=User.Role.CUSTOMER
        )

        # Worker 1 User & Profile (Yonas)
        self.worker_user = User.objects.create_user(
            email='electrician@example.com',
            password='Password123!',
            first_name='Yonas',
            last_name='Tesfaye',
            phone_number='+251922002233',
            role=User.Role.WORKER
        )
        self.worker_profile = WorkerProfile.objects.create(
            user=self.worker_user,
            primary_category=self.category,
            trade_title='Licensed Master Electrician',
            bio='Expert in fuse boxes, lighting, and rewiring.',
            hourly_rate=50.00,
            experience_years=10,
            is_available=True
        )

        # Service for Yonas
        self.service_yonas = WorkerService.objects.create(
            worker=self.worker_profile,
            category=self.category,
            title='Fuse Box Inspection',
            description='Detailed fuse box and breaker load inspection.',
            price=75.00,
            currency='ETB',
            price_type='fixed',
            is_active=True
        )

        # Worker 2 User & Profile (Dawit - Plumber)
        self.plumbing_cat = ServiceCategory.objects.create(
            slug='plumbing',
            name='Plumbing Services',
            trade_key='plumber',
            description='Plumbing repairs',
            icon_name='Wrench'
        )
        self.worker_dawit_user = User.objects.create_user(
            email='dawit@example.com',
            password='Password123!',
            first_name='Dawit',
            last_name='Bekele',
            phone_number='+251944004455',
            role=User.Role.WORKER
        )
        self.worker_dawit = WorkerProfile.objects.create(
            user=self.worker_dawit_user,
            primary_category=self.plumbing_cat,
            trade_title='Master Plumber',
            bio='Pipe diagnostics.',
            hourly_rate=45.00,
            is_available=True
        )
        self.service_dawit = WorkerService.objects.create(
            worker=self.worker_dawit,
            category=self.plumbing_cat,
            title='Pipe Unclogging',
            description='Clean drain.',
            price=40.00,
            currency='ETB',
            is_active=True
        )

        # Other User
        self.other_user = User.objects.create_user(
            email='stranger@example.com',
            password='Password123!',
            first_name='Other',
            last_name='Person',
            phone_number='+251933003344',
            role=User.Role.CUSTOMER
        )

    # -------------------------------------------------------------------------
    # 1. BOOKING CREATION & VALIDATION
    # -------------------------------------------------------------------------

    def test_customer_can_create_booking_with_service(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')
        scheduled = (timezone.now() + timedelta(days=2)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "service_id": str(self.service_yonas.id),
            "scheduled_date": str(scheduled),
            "scheduled_time_slot": "09:00 AM - 11:00 AM",
            "service_address": "Bole Atlas, House #104",
            "service_city": "Addis Ababa",
            "customer_notes": "Main circuit breaker trips frequently under heavy load."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        booking = Booking.objects.first()
        self.assertEqual(booking.customer, self.customer)
        self.assertEqual(booking.worker, self.worker_profile)
        self.assertEqual(booking.status, Booking.Status.PENDING)
        self.assertEqual(float(booking.agreed_price), 75.00)
        self.assertEqual(booking.service_title, "Fuse Box Inspection")

    def test_price_snapshot_preserved_after_service_price_change(self):
        """Verifies that future price edits to the service do NOT alter existing agreed price."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')
        scheduled = (timezone.now() + timedelta(days=2)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "service_id": str(self.service_yonas.id),
            "scheduled_date": str(scheduled),
            "scheduled_time_slot": "10:00 AM - 12:00 PM",
            "service_address": "Bole",
            "customer_notes": "Inspect fuse box wiring."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.first()
        self.assertEqual(float(booking.agreed_price), 75.00)

        # Worker later increases their price from 75 to 150
        self.service_yonas.price = 150.00
        self.service_yonas.save()

        # Existing booking must still have agreed price of 75.00
        booking.refresh_from_db()
        self.assertEqual(float(booking.agreed_price), 75.00)

    def test_past_date_rejected(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')
        past_date = (timezone.now() - timedelta(days=1)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "service_title": "Past Service",
            "scheduled_date": str(past_date),
            "scheduled_time_slot": "10:00 AM - 12:00 PM",
            "service_address": "Bole",
            "customer_notes": "Attempting past date booking."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_short_description_rejected(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')
        scheduled = (timezone.now() + timedelta(days=2)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "scheduled_date": str(scheduled),
            "scheduled_time_slot": "10:00 AM - 12:00 PM",
            "service_address": "Bole",
            "customer_notes": "short"  # Less than 10 characters
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_service_ownership_mismatch_rejected(self):
        """Passing Dawit's service when booking Yonas must fail."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')
        scheduled = (timezone.now() + timedelta(days=2)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "service_id": str(self.service_dawit.id),  # Belongs to Dawit, not Yonas!
            "scheduled_date": str(scheduled),
            "scheduled_time_slot": "10:00 AM - 12:00 PM",
            "service_address": "Bole",
            "customer_notes": "Inspect fuse box wiring."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_worker_cannot_book_own_profile(self):
        self.client.force_authenticate(user=self.worker_user)
        url = reverse('bookings:booking-list-create')
        scheduled = (timezone.now() + timedelta(days=2)).date()

        payload = {
            "worker_id": str(self.worker_profile.id),
            "service_title": "Self Job",
            "scheduled_date": str(scheduled),
            "scheduled_time_slot": "10:00 AM - 12:00 PM",
            "service_address": "My home",
            "customer_notes": "Booking myself should not be permitted."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -------------------------------------------------------------------------
    # 2. STATUS TRANSITIONS & ROLES
    # -------------------------------------------------------------------------

    def test_worker_can_accept_and_mark_as_done(self):
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Light Fixture Installation",
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Kazanchis",
            agreed_price=75.00
        )
        url = reverse('bookings:booking-status-transition', kwargs={'pk': booking.id})

        # 1. Worker accepts
        self.client.force_authenticate(user=self.worker_user)
        res_accept = self.client.post(url, {"new_status": "accepted"}, format='json')
        self.assertEqual(res_accept.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.ACCEPTED)
        self.assertIsNotNone(booking.accepted_at)

        # 2. Worker marks as done (completed)
        res_complete = self.client.post(url, {"new_status": "completed"}, format='json')
        self.assertEqual(res_complete.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.COMPLETED)
        self.assertIsNotNone(booking.completed_at)

    def test_worker_can_reject_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Light Fixture Installation",
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Kazanchis",
            agreed_price=75.00
        )
        url = reverse('bookings:booking-status-transition', kwargs={'pk': booking.id})

        self.client.force_authenticate(user=self.worker_user)
        response = self.client.post(url, {
            "new_status": "declined",
            "reason": "Fully booked on this scheduled date."
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.DECLINED)

    def test_customer_can_cancel_pending_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Wall Socket Rewiring",
            scheduled_date=(timezone.now() + timedelta(days=3)).date(),
            scheduled_time_slot="10:00 AM - 12:00 PM",
            service_address="Bole",
            agreed_price=60.00
        )
        url = reverse('bookings:booking-status-transition', kwargs={'pk': booking.id})

        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url, {
            "new_status": "cancelled",
            "reason": "Plans changed, will reschedule."
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.CANCELLED)

    def test_disallowed_transition_rejected(self):
        """Cannot jump from pending directly to completed without acceptance."""
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Wiring Repair",
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Kazanchis",
            agreed_price=75.00,
            status=Booking.Status.PENDING
        )
        url = reverse('bookings:booking-status-transition', kwargs={'pk': booking.id})
        self.client.force_authenticate(user=self.worker_user)
        response = self.client.post(url, {"new_status": "completed"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_customer_cannot_accept_own_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Light Fixture Installation",
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Kazanchis",
            agreed_price=75.00
        )
        url = reverse('bookings:booking-status-transition', kwargs={'pk': booking.id})
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url, {"new_status": "accepted"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unrelated_user_cannot_access_booking(self):
        booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Private Booking",
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Secret Location",
            agreed_price=100.00
        )
        url = reverse('bookings:booking-detail', kwargs={'pk': booking.id})
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # -------------------------------------------------------------------------
    # 3. LIST FILTERING & PAGINATION
    # -------------------------------------------------------------------------

    def test_booking_list_filtering_and_pagination(self):
        Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Job 1 (Pending)",
            status=Booking.Status.PENDING,
            scheduled_date=(timezone.now() + timedelta(days=1)).date(),
            scheduled_time_slot="09:00 AM",
            service_address="Addis",
            agreed_price=50.00
        )
        Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Job 2 (Accepted)",
            status=Booking.Status.ACCEPTED,
            scheduled_date=(timezone.now() + timedelta(days=2)).date(),
            scheduled_time_slot="10:00 AM",
            service_address="Addis",
            agreed_price=60.00
        )

        self.client.force_authenticate(user=self.customer)
        url = reverse('bookings:booking-list-create')

        # Filter by status=pending
        res_pending = self.client.get(url, {'status': 'pending'})
        self.assertEqual(res_pending.status_code, status.HTTP_200_OK)
        self.assertIn('results', res_pending.data)
        self.assertEqual(len(res_pending.data['results']), 1)
        self.assertEqual(res_pending.data['results'][0]['status'], 'pending')
