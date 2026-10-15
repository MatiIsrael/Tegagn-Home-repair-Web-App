from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.services.models import ServiceCategory
from apps.workers.models import WorkerProfile

class AuthenticationAndProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = ServiceCategory.objects.create(
            slug='plumbing',
            name='Plumbing Services',
            trade_key='plumber',
            description='Pipe and water repairs',
            icon_name='Wrench'
        )

    def test_customer_registration_success(self):
        url = reverse('accounts:register-customer')
        payload = {
            "email": "customer.test@example.com",
            "first_name": "Almaz",
            "last_name": "Kebede",
            "phone_number": "+251911223344",
            "city": "Addis Ababa",
            "address_line": "Bole Subcity, Woreda 03",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="customer.test@example.com").exists())
        user = User.objects.get(email="customer.test@example.com")
        self.assertEqual(user.role, User.Role.CUSTOMER)
        # Ensure password is not plain text in DB
        self.assertNotEqual(user.password, "SecurePassword123!")
        self.assertTrue(user.check_password("SecurePassword123!"))

    def test_cannot_register_as_admin_publicly(self):
        """Malicious payload attempting to inject role='admin' must be ignored."""
        url = reverse('accounts:register-customer')
        payload = {
            "email": "hacker@example.com",
            "first_name": "Bad",
            "last_name": "Actor",
            "phone_number": "+251911229999",
            "password": "SecurePassword123!",
            "password_confirm": "SecurePassword123!",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="hacker@example.com")
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_customer_registration_password_mismatch(self):
        url = reverse('accounts:register-customer')
        payload = {
            "email": "mismatch@example.com",
            "first_name": "Almaz",
            "last_name": "Kebede",
            "phone_number": "+251911223345",
            "password": "SecurePassword123!",
            "password_confirm": "DifferentPassword!"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_worker_registration_creates_profile(self):
        url = reverse('accounts:register-worker')
        payload = {
            "email": "worker.test@example.com",
            "first_name": "Dawit",
            "last_name": "Bekele",
            "phone_number": "+251922334455",
            "city": "Addis Ababa",
            "password": "TradePassword123!",
            "password_confirm": "TradePassword123!",
            "primary_category_id": str(self.category.id),
            "trade_title": "Certified Master Plumber",
            "hourly_rate": "45.00",
            "experience_years": 8,
            "bio": "Experienced plumbing professional specializing in copper and PVC pipe repairs.",
            "service_areas": ["Bole", "Kazanchis", "Sarbet"]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="worker.test@example.com").exists())
        worker_user = User.objects.get(email="worker.test@example.com")
        self.assertEqual(worker_user.role, User.Role.WORKER)
        self.assertTrue(hasattr(worker_user, 'worker_profile'))
        self.assertEqual(worker_user.worker_profile.trade_title, "Certified Master Plumber")

    def test_jwt_login_success(self):
        User.objects.create_user(
            email="login.test@example.com",
            password="LoginPassword123!",
            first_name="Test",
            last_name="User",
            phone_number="+251933445566",
            role=User.Role.CUSTOMER
        )
        url = reverse('accounts:login')
        payload = {
            "email": "login.test@example.com",
            "password": "LoginPassword123!"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], "login.test@example.com")

    def test_jwt_login_invalid_credentials(self):
        User.objects.create_user(
            email="user@example.com",
            password="CorrectPassword123!",
            first_name="User",
            last_name="One",
            phone_number="+251944556677"
        )
        url = reverse('accounts:login')
        # Wrong password
        response = self.client.post(url, {"email": "user@example.com", "password": "WrongPassword!"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        # Non-existent user
        response = self.client.post(url, {"email": "unknown@example.com", "password": "SomePassword!"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_current_user_profile_get_and_patch(self):
        user = User.objects.create_user(
            email="profile@example.com",
            password="Password123!",
            first_name="Original",
            last_name="Name",
            phone_number="+251955667788",
            city="Addis Ababa",
            role=User.Role.CUSTOMER
        )
        url = reverse('accounts:user-profile')

        # Unauthenticated request fails with 401
        res_unauth = self.client.get(url)
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Authenticated GET
        self.client.force_authenticate(user=user)
        res_get = self.client.get(url)
        self.assertEqual(res_get.status_code, status.HTTP_200_OK)
        self.assertEqual(res_get.data['first_name'], "Original")
        self.assertEqual(res_get.data['role'], "customer")

        # Authenticated PATCH
        patch_payload = {
            "first_name": "Updated",
            "city": "Hawassa",
            "role": "admin"  # Malicious attempt to change role
        }
        res_patch = self.client.patch(url, patch_payload, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.first_name, "Updated")
        self.assertEqual(user.city, "Hawassa")
        self.assertEqual(user.role, User.Role.CUSTOMER)  # Role remains customer!

    def test_logout_blacklists_refresh_token(self):
        user = User.objects.create_user(
            email="logout@example.com",
            password="Password123!",
            first_name="Logout",
            last_name="User",
            phone_number="+251966778899"
        )
        # Obtain tokens
        login_res = self.client.post(reverse('accounts:login'), {
            "email": "logout@example.com",
            "password": "Password123!"
        }, format='json')
        refresh_token = login_res.data['refresh']

        # Call logout
        self.client.force_authenticate(user=user)
        logout_res = self.client.post(reverse('accounts:logout'), {
            "refresh": refresh_token
        }, format='json')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

        # Attempt to refresh with the blacklisted token must fail with 401
        refresh_res = self.client.post(reverse('token_refresh'), {
            "refresh": refresh_token
        }, format='json')
        self.assertEqual(refresh_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_customer_can_create_worker_profile(self):
        """Tests that an existing customer can provision a WorkerProfile via POST /api/v1/workers/me/."""
        customer = User.objects.create_user(
            email="promoted@example.com",
            password="Password123!",
            first_name="Abebe",
            last_name="Kebede",
            phone_number="+251977889900",
            role=User.Role.CUSTOMER
        )
        self.client.force_authenticate(user=customer)
        url = reverse('workers:worker-me')

        # GET initially returns 404
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_404_NOT_FOUND)

        # POST creates worker profile
        payload = {
            "primary_category_id": str(self.category.id),
            "trade_title": "Master Pipe Specialist",
            "hourly_rate": "35.00",
            "experience_years": 5,
            "bio": "Expert in sanitary installations and leak repairs.",
            "service_areas": ["Bole", "CMC"]
        }
        post_res = self.client.post(url, payload, format='json')
        self.assertEqual(post_res.status_code, status.HTTP_201_CREATED)

        customer.refresh_from_db()
        self.assertEqual(customer.role, User.Role.WORKER)
        self.assertTrue(hasattr(customer, 'worker_profile'))
        self.assertEqual(customer.worker_profile.trade_title, "Master Pipe Specialist")

        # PATCH updates trade profile
        patch_res = self.client.patch(url, {
            "hourly_rate": "55.00",
            "trade_title": "Senior Master Pipe Specialist"
        }, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        customer.worker_profile.refresh_from_db()
        self.assertEqual(float(customer.worker_profile.hourly_rate), 55.00)
