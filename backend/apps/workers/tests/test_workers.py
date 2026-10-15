from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.services.models import ServiceCategory
from apps.workers.models import WorkerProfile, WorkerService

class WorkerSearchAndServicesTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Categories
        self.plumbing = ServiceCategory.objects.create(
            slug='plumbing',
            name='Plumbing Services',
            trade_key='plumber',
            description='Pipe repairs and plumbing',
            icon_name='Wrench'
        )
        self.electrical = ServiceCategory.objects.create(
            slug='electrical',
            name='Electrical Work',
            trade_key='electrician',
            description='Wiring and diagnostics',
            icon_name='Zap'
        )

        # Worker 1: Abebe (Plumber, $40/hr, 4.8★, Bole)
        self.user_abebe = User.objects.create_user(
            email='abebe@example.com',
            password='Password123!',
            first_name='Abebe',
            last_name='Tadesse',
            phone_number='+251911111111',
            city='Addis Ababa',
            role=User.Role.WORKER
        )
        self.worker_abebe = WorkerProfile.objects.create(
            user=self.user_abebe,
            primary_category=self.plumbing,
            trade_title='Master Plumber & Pipe Specialist',
            bio='Expert in concealed copper piping and high-pressure drainage.',
            hourly_rate=40.00,
            experience_years=12,
            rating_average=4.80,
            reviews_count=24,
            completed_jobs_count=35,
            is_available=True,
            is_verified=True,
            is_emergency_ready=True,
            skills=['Copper Piping', 'Drain Cleaning', 'Soldering'],
            service_areas=['Bole', 'Kazanchis']
        )

        # Worker 2: Sara (Electrician, $65/hr, 4.9★, Hawassa)
        self.user_sara = User.objects.create_user(
            email='sara@example.com',
            password='Password123!',
            first_name='Sara',
            last_name='Mekonnen',
            phone_number='+251922222222',
            city='Hawassa',
            role=User.Role.WORKER
        )
        self.worker_sara = WorkerProfile.objects.create(
            user=self.user_sara,
            primary_category=self.electrical,
            trade_title='Solar & Wiring Engineer',
            bio='Certified solar system and breaker specialist.',
            hourly_rate=65.00,
            experience_years=7,
            rating_average=4.90,
            reviews_count=18,
            completed_jobs_count=20,
            is_available=True,
            is_verified=True,
            is_emergency_ready=False,
            skills=['Solar Inverters', 'Rewiring', 'Breaker Panels'],
            service_areas=['Piazza', 'Lake Area']
        )

        # Customer User
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            password='Password123!',
            first_name='Kassahun',
            last_name='Desta',
            phone_number='+251933333333',
            city='Addis Ababa',
            role=User.Role.CUSTOMER
        )

        # Service for Abebe
        self.service_abebe = WorkerService.objects.create(
            worker=self.worker_abebe,
            category=self.plumbing,
            title='Emergency Leak Repair',
            description='Fast on-site pipe leak repair and sealing.',
            price=80.00,
            currency='ETB',
            price_type='fixed',
            is_active=True
        )

    # -------------------------------------------------------------------------
    # 1. PUBLIC DIRECTORY SEARCH & FILTERING
    # -------------------------------------------------------------------------

    def test_search_by_skill(self):
        url = reverse('workers:worker-list')
        response = self.client.get(url, {'skill': 'Copper Piping'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should contain Abebe, but not Sara
        results = response.data['results']
        worker_ids = [w['id'] for w in results]
        self.assertIn(str(self.worker_abebe.id), worker_ids)
        self.assertNotIn(str(self.worker_sara.id), worker_ids)

    def test_filter_by_category_slug(self):
        url = reverse('workers:worker-list')
        response = self.client.get(url, {'category': 'electrical'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.worker_sara.id))

    def test_filter_by_location(self):
        url = reverse('workers:worker-list')
        response = self.client.get(url, {'city': 'Hawassa'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.worker_sara.id))

    def test_filter_by_price_range(self):
        url = reverse('workers:worker-list')
        # Filter rate between $30 and $50 -> only Abebe ($40)
        response = self.client.get(url, {'min_price': '30', 'max_price': '50'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], str(self.worker_abebe.id))

    def test_safe_sorting(self):
        url = reverse('workers:worker-list')
        # Sort by price ascending: Abebe ($40) then Sara ($65)
        res_price_asc = self.client.get(url, {'sortBy': 'price_asc'})
        self.assertEqual(res_price_asc.status_code, status.HTTP_200_OK)
        results = res_price_asc.data['results']
        self.assertEqual(results[0]['id'], str(self.worker_abebe.id))
        self.assertEqual(results[1]['id'], str(self.worker_sara.id))

        # Sort by price descending: Sara ($65) then Abebe ($40)
        res_price_desc = self.client.get(url, {'sortBy': 'price_desc'})
        self.assertEqual(res_price_desc.status_code, status.HTTP_200_OK)
        results_desc = res_price_desc.data['results']
        self.assertEqual(results_desc[0]['id'], str(self.worker_sara.id))
        self.assertEqual(results_desc[1]['id'], str(self.worker_abebe.id))

    def test_pagination_structure(self):
        url = reverse('workers:worker-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('total_pages', response.data)
        self.assertIn('current_page', response.data)
        self.assertIn('results', response.data)

    def test_public_profile_excludes_private_fields(self):
        url = reverse('workers:worker-detail', kwargs={'pk': self.worker_abebe.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Ensure private email and address are NOT exposed
        self.assertNotIn('email', response.data)
        self.assertNotIn('address_line', response.data)
        self.assertNotIn('password', response.data)
        self.assertIn('full_name', response.data)
        self.assertIn('services', response.data)

    # -------------------------------------------------------------------------
    # 2. WORKER SERVICE CRUD & AUTHORIZATION
    # -------------------------------------------------------------------------

    def test_worker_can_create_service(self):
        self.client.force_authenticate(user=self.user_abebe)
        url = reverse('workers:worker-services-list-create')
        payload = {
            "title": "Drain Snake Cleaning",
            "description": "High-powered electric auger unclogging for kitchens and bathrooms.",
            "price": "60.00",
            "currency": "ETB",
            "price_type": "fixed",
            "estimated_duration_minutes": 90
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "Drain Snake Cleaning")
        self.assertEqual(response.data['worker_id'], str(self.worker_abebe.id))

    def test_worker_can_update_own_service(self):
        self.client.force_authenticate(user=self.user_abebe)
        url = reverse('workers:worker-service-detail', kwargs={'pk': self.service_abebe.id})
        payload = {
            "price": "95.00",
            "title": "Emergency Copper Pipe Leak Repair"
        }
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.service_abebe.refresh_from_db()
        self.assertEqual(float(self.service_abebe.price), 95.00)

    def test_worker_cannot_edit_other_workers_service(self):
        """Worker Sara must NOT be allowed to edit Worker Abebe's service."""
        self.client.force_authenticate(user=self.user_sara)
        url = reverse('workers:worker-service-detail', kwargs={'pk': self.service_abebe.id})
        payload = {"price": "10.00"}
        response = self.client.patch(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_worker_cannot_delete_other_workers_service(self):
        """Worker Sara must NOT be allowed to delete Worker Abebe's service."""
        self.client.force_authenticate(user=self.user_sara)
        url = reverse('workers:worker-service-detail', kwargs={'pk': self.service_abebe.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(WorkerService.objects.filter(id=self.service_abebe.id).exists())

    def test_customer_cannot_create_service(self):
        self.client.force_authenticate(user=self.customer_user)
        url = reverse('workers:worker-services-list-create')
        payload = {
            "title": "Unauthorized Service",
            "price": "50.00"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
