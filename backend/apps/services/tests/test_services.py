from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.services.models import ServiceCategory
from apps.workers.models import WorkerProfile

class ServiceCategoryPublicAndAdminTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Service categories
        self.active_category = ServiceCategory.objects.create(
            slug='plumbing',
            name='Plumbing Services',
            trade_key='plumber',
            description='Pipe and drain repairs',
            icon_name='Wrench',
            is_active=True,
            display_order=1
        )
        self.inactive_category = ServiceCategory.objects.create(
            slug='solar',
            name='Solar Power Systems',
            trade_key='general',
            description='Solar panel installation',
            icon_name='Sun',
            is_active=False,
            display_order=99
        )

        # Users
        self.customer = User.objects.create_user(
            email='client@example.com',
            password='Password123!',
            first_name='Abel',
            last_name='Tesfaye',
            phone_number='+251911223344',
            role=User.Role.CUSTOMER
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='AdminPassword123!',
            first_name='Super',
            last_name='Admin',
            phone_number='+251911000000',
            role=User.Role.ADMIN
        )

        # Add a worker to active category
        self.worker_user = User.objects.create_user(
            email='plumber@example.com',
            password='Password123!',
            first_name='Kassahun',
            last_name='Tilahun',
            phone_number='+251922334455',
            role=User.Role.WORKER
        )
        self.worker_profile = WorkerProfile.objects.create(
            user=self.worker_user,
            primary_category=self.active_category,
            trade_title='Master Plumber',
            bio='Expert in plumbing.',
            hourly_rate=50.00,
            is_available=True
        )

    def test_public_can_list_active_categories_only(self):
        """Public endpoint returns active categories and omits inactive ones."""
        url = reverse('services:category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        slugs = [c['slug'] for c in response.data]
        self.assertIn('plumbing', slugs)
        self.assertNotIn('solar', slugs)

        # Verify workers_count accurately reflects available workers
        plumbing_data = next(c for c in response.data if c['slug'] == 'plumbing')
        self.assertEqual(plumbing_data['workers_count'], 1)

    def test_public_can_retrieve_single_category(self):
        """Public can view details of an active category via slug."""
        url = reverse('services:category-detail', kwargs={'slug': 'plumbing'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Plumbing Services')

    def test_customer_cannot_create_or_modify_category(self):
        """Customers receive 403 Forbidden when attempting to create/modify categories."""
        self.client.force_authenticate(user=self.customer)
        list_url = reverse('services:category-list')
        res_post = self.client.post(list_url, {
            'slug': 'carpentry',
            'name': 'Carpentry',
            'trade_key': 'carpenter',
            'description': 'Woodwork'
        }, format='json')
        self.assertEqual(res_post.status_code, status.HTTP_403_FORBIDDEN)

        detail_url = reverse('services:category-detail', kwargs={'slug': 'plumbing'})
        res_patch = self.client.patch(detail_url, {'name': 'Hacked Plumbing'}, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_and_update_category(self):
        """Admin can create new category and update existing ones."""
        self.client.force_authenticate(user=self.admin)
        list_url = reverse('services:category-list')
        res_create = self.client.post(list_url, {
            'slug': 'painting',
            'name': 'Painting & Drywall',
            'trade_key': 'painter',
            'description': 'Full house painting',
            'icon_name': 'Paintbrush',
            'is_active': True,
            'display_order': 2
        }, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ServiceCategory.objects.filter(slug='painting').exists())

        detail_url = reverse('services:category-detail', kwargs={'slug': 'painting'})
        res_patch = self.client.patch(detail_url, {'name': 'Master Painting & Drywall'}, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(ServiceCategory.objects.get(slug='painting').name, 'Master Painting & Drywall')
