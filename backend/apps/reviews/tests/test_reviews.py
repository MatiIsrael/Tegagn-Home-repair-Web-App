from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.services.models import ServiceCategory
from apps.workers.models import WorkerProfile
from apps.bookings.models import Booking
from apps.reviews.models import Review

class ReviewValidationAndIntegrityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.category = ServiceCategory.objects.create(
            slug='carpentry',
            name='Carpentry Services',
            trade_key='carpenter',
            description='Woodwork and cabinetry',
            icon_name='Hammer'
        )

        self.customer = User.objects.create_user(
            email='review.customer@example.com',
            password='Password123!',
            first_name='Helen',
            last_name='Solomon',
            phone_number='+251911998877',
            role=User.Role.CUSTOMER
        )

        self.other_customer = User.objects.create_user(
            email='other.customer@example.com',
            password='Password123!',
            first_name='Dawit',
            last_name='Bekele',
            phone_number='+251911998899',
            role=User.Role.CUSTOMER
        )

        self.worker_user = User.objects.create_user(
            email='carpenter@example.com',
            password='Password123!',
            first_name='Tadesse',
            last_name='Kassa',
            phone_number='+251922998877',
            role=User.Role.WORKER
        )
        self.worker_profile = WorkerProfile.objects.create(
            user=self.worker_user,
            primary_category=self.category,
            trade_title='Fine Furniture Carpenter',
            bio='Custom wood fittings and restoration.',
            hourly_rate=60.00,
            experience_years=12
        )

        self.other_worker_user = User.objects.create_user(
            email='other.worker@example.com',
            password='Password123!',
            first_name='Abebe',
            last_name='Kebede',
            phone_number='+251922998888',
            role=User.Role.WORKER
        )
        self.other_worker_profile = WorkerProfile.objects.create(
            user=self.other_worker_user,
            primary_category=self.category,
            trade_title='General Carpenter',
            bio='Door framing and shelves.',
            hourly_rate=45.00,
            experience_years=5
        )

        # A completed booking
        self.completed_booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Kitchen Cabinet Assembly",
            status=Booking.Status.COMPLETED,
            scheduled_date=(timezone.now() - timedelta(days=1)).date(),
            scheduled_time_slot="10:00 AM - 01:00 PM",
            service_address="Sarbet",
            agreed_price=180.00
        )

        # An uncompleted booking
        self.pending_booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Door Lock Replacement",
            status=Booking.Status.PENDING,
            scheduled_date=(timezone.now() + timedelta(days=2)).date(),
            scheduled_time_slot="03:00 PM - 05:00 PM",
            service_address="Sarbet",
            agreed_price=40.00
        )

        # A cancelled booking
        self.cancelled_booking = Booking.objects.create(
            customer=self.customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Window Frame Repair",
            status=Booking.Status.CANCELLED,
            scheduled_date=(timezone.now() - timedelta(days=3)).date(),
            scheduled_time_slot="09:00 AM - 11:00 AM",
            service_address="Sarbet",
            agreed_price=50.00
        )

    def test_customer_can_review_completed_booking(self):
        """Customer submits a detailed review with sub-scores on a completed booking."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('reviews:review-list-create')
        payload = {
            "booking_id": str(self.completed_booking.id),
            "rating": 5,
            "comment": "Exceptional craftsmanship. The cabinets fit perfectly and the area was left tidy.",
            "punctuality_rating": 5,
            "quality_rating": 5,
            "cleanliness_rating": 5
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)

        # Verify review details
        review = Review.objects.first()
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.customer, self.customer)
        self.assertEqual(review.worker, self.worker_profile)

        # Verify worker profile rating average and reviews count updated automatically
        self.worker_profile.refresh_from_db()
        self.assertEqual(float(self.worker_profile.rating_average), 5.0)
        self.assertEqual(self.worker_profile.reviews_count, 1)

    def test_cannot_review_pending_or_cancelled_booking(self):
        """Reviews cannot be placed on bookings that are pending or cancelled."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('reviews:review-list-create')

        # Test pending booking rejection
        pending_payload = {
            "booking_id": str(self.pending_booking.id),
            "rating": 4,
            "comment": "Work has not even started yet."
        }
        res_pending = self.client.post(url, pending_payload, format='json')
        self.assertEqual(res_pending.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Only completed jobs can be reviewed", str(res_pending.data))

        # Test cancelled booking rejection
        cancelled_payload = {
            "booking_id": str(self.cancelled_booking.id),
            "rating": 1,
            "comment": "Job was cancelled before arrival."
        }
        res_cancelled = self.client.post(url, cancelled_payload, format='json')
        self.assertEqual(res_cancelled.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_duplicate_review_is_prevented(self):
        """Only one review permitted per booking (1-to-1 relationship enforced)."""
        # Create first review
        Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment="First review was great."
        )

        # Attempt to post a second review for the same booking
        self.client.force_authenticate(user=self.customer)
        url = reverse('reviews:review-list-create')
        payload = {
            "booking_id": str(self.completed_booking.id),
            "rating": 1,
            "comment": "Duplicate attempt should be blocked."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("A review has already been submitted", str(response.data))
        self.assertEqual(Review.objects.count(), 1)

    def test_non_participant_customer_cannot_review_booking(self):
        """A customer cannot submit a review for a booking made by someone else."""
        self.client.force_authenticate(user=self.other_customer)
        url = reverse('reviews:review-list-create')
        payload = {
            "booking_id": str(self.completed_booking.id),
            "rating": 5,
            "comment": "Unauthorized third party review attempt."
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You can only review bookings made from your customer account", str(response.data))
        self.assertEqual(Review.objects.count(), 0)

    def test_worker_cannot_review_themselves(self):
        """Tradespeople cannot review bookings where they are the assigned worker."""
        self.client.force_authenticate(user=self.worker_user)
        url = reverse('reviews:review-list-create')
        payload = {
            "booking_id": str(self.completed_booking.id),
            "rating": 5,
            "comment": "Self rating should never be allowed."
        }
        response = self.client.post(url, payload, format='json')
        # Role permission blocks workers from posting reviews
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 0)

    def test_rating_bounds_validation(self):
        """Ratings must be between 1 and 5 inclusive."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('reviews:review-list-create')

        # Rating 0 (below minimum 1)
        res_zero = self.client.post(url, {
            "booking_id": str(self.completed_booking.id),
            "rating": 0,
            "comment": "Attempting rating below minimum 1."
        }, format='json')
        self.assertEqual(res_zero.status_code, status.HTTP_400_BAD_REQUEST)

        # Rating 6 (above maximum 5)
        res_six = self.client.post(url, {
            "booking_id": str(self.completed_booking.id),
            "rating": 6,
            "comment": "Attempting rating above maximum 5."
        }, format='json')
        self.assertEqual(res_six.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_comment_length_validation(self):
        """Comments must be descriptive and at least 10 characters."""
        self.client.force_authenticate(user=self.customer)
        url = reverse('reviews:review-list-create')
        payload = {
            "booking_id": str(self.completed_booking.id),
            "rating": 5,
            "comment": "Too short"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("at least 10 characters long", str(response.data))

    def test_worker_can_reply_to_their_review(self):
        """The reviewed worker can post an official response to the customer feedback."""
        review = Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment="Wonderful work on the custom kitchen cabinets."
        )

        self.client.force_authenticate(user=self.worker_user)
        url = reverse('reviews:review-reply', kwargs={'pk': review.id})
        payload = {
            "worker_reply": "Thank you Helen! It was a pleasure working on your kitchen."
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        review.refresh_from_db()
        self.assertEqual(review.worker_reply, payload["worker_reply"])
        self.assertIsNotNone(review.worker_replied_at)

    def test_other_worker_cannot_reply_to_review(self):
        """Another worker cannot post a reply to a review not belonging to them."""
        review = Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment="Great carpentry work."
        )

        self.client.force_authenticate(user=self.other_worker_user)
        url = reverse('reviews:review-reply', kwargs={'pk': review.id})
        payload = {
            "worker_reply": "Unauthorized reply from another worker."
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_worker_reply_prevented(self):
        """Worker cannot overwrite or duplicate an official reply once posted."""
        review = Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment="Excellent custom cabinets.",
            worker_reply="Original response.",
            worker_replied_at=timezone.now()
        )

        self.client.force_authenticate(user=self.worker_user)
        url = reverse('reviews:review-reply', kwargs={'pk': review.id})
        payload = {
            "worker_reply": "Second response attempt."
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("A reply has already been submitted", str(response.data))

    def test_review_listing_filtering_and_pagination(self):
        """Reviews list supports worker_id, min_rating, and StandardResultsPagination."""
        # Create second booking & review with 4 stars
        second_booking = Booking.objects.create(
            customer=self.other_customer,
            worker=self.worker_profile,
            service_category=self.category,
            service_title="Bookshelf Assembly",
            status=Booking.Status.COMPLETED,
            scheduled_date=(timezone.now() - timedelta(days=5)).date(),
            scheduled_time_slot="02:00 PM - 04:00 PM",
            service_address="Bole",
            agreed_price=90.00
        )
        Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=5,
            comment="First review with 5 stars."
        )
        Review.objects.create(
            booking=second_booking,
            customer=self.other_customer,
            worker=self.worker_profile,
            rating=4,
            comment="Second review with 4 stars."
        )

        url = reverse('reviews:review-list-create')
        
        # Test worker filtering and pagination structure
        res = self.client.get(f"{url}?worker_id={self.worker_profile.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('count', res.data)
        self.assertIn('results', res.data)
        self.assertEqual(res.data['count'], 2)

        # Test min_rating filter
        res_filtered = self.client.get(f"{url}?worker_id={self.worker_profile.id}&min_rating=5")
        self.assertEqual(res_filtered.status_code, status.HTTP_200_OK)
        self.assertEqual(res_filtered.data['count'], 1)
        self.assertEqual(res_filtered.data['results'][0]['rating'], 5)

    def test_worker_aggregates_recalculated_on_delete(self):
        """Worker profile rating average and reviews count update when review is removed."""
        review = Review.objects.create(
            booking=self.completed_booking,
            customer=self.customer,
            worker=self.worker_profile,
            rating=4,
            comment="Good reliable service."
        )
        self.worker_profile.refresh_from_db()
        self.assertEqual(float(self.worker_profile.rating_average), 4.0)
        self.assertEqual(self.worker_profile.reviews_count, 1)

        # Delete review
        review.delete()
        self.worker_profile.refresh_from_db()
        self.assertEqual(float(self.worker_profile.rating_average), 0.0)
        self.assertEqual(self.worker_profile.reviews_count, 0)
