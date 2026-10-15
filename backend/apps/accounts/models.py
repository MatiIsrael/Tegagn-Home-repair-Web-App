import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.core.validators import RegexValidator

class UserManager(BaseUserManager):
    """Custom user manager supporting email-based authentication."""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set.')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model for Tegagn.
    Acts as the single source of authentication truth for both customers and workers.
    """
    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer / Homeowner'
        WORKER = 'worker', 'Trade Service Professional'
        ADMIN = 'admin', 'Platform Administrator'

    phone_regex = RegexValidator(
        regex=r'^\+?[0-9]{9,15}$',
        message="Phone number must be entered in the format: '+251912345678' or '0912345678'. Up to 15 digits."
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True, verbose_name='Email Address')
    first_name = models.CharField(max_length=60, verbose_name='First Name')
    last_name = models.CharField(max_length=60, verbose_name='Last Name')
    phone_number = models.CharField(validators=[phone_regex], max_length=20, unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER, db_index=True)
    city = models.CharField(max_length=80, default='Addis Ababa')
    address_line = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True, max_length=500)
    
    # Platform status flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone_number']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.role}"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_short_name(self):
        return self.first_name

    @property
    def is_customer(self):
        return self.role == self.Role.CUSTOMER

    @property
    def is_worker(self):
        return self.role == self.Role.WORKER

    @property
    def is_administrator(self):
        return self.role == self.Role.ADMIN or self.is_superuser
