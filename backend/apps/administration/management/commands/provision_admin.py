import getpass
from decouple import config
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from apps.accounts.models import User

class Command(BaseCommand):
    help = "Securely provisions an initial platform administrator with Role.ADMIN and superuser privileges."

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help="Administrator email address")
        parser.add_argument('--password', type=str, help="Strong password for the admin account")
        parser.add_argument('--phone', type=str, help="Phone number with country code e.g. +251911000000")
        parser.add_argument('--first-name', type=str, default='Platform', help="Admin first name")
        parser.add_argument('--last-name', type=str, default='Administrator', help="Admin last name")

    def handle(self, *args, **options):
        email = options.get('email') or config('INITIAL_ADMIN_EMAIL', default=None)
        phone = options.get('phone') or config('INITIAL_ADMIN_PHONE', default='+251911000001')
        first_name = options.get('first_name') or 'Platform'
        last_name = options.get('last_name') or 'Administrator'
        password = options.get('password') or config('INITIAL_ADMIN_PASSWORD', default=None)

        if not email:
            email = input("Enter Administrator Email: ").strip()

        if not email:
            raise CommandError("Email address is required to provision an administrator.")

        if not password:
            password = getpass.getpass("Enter Administrator Password: ")
            confirm_password = getpass.getpass("Confirm Administrator Password: ")
            if password != confirm_password:
                raise CommandError("Passwords do not match.")

        # Validate password strength according to settings.AUTH_PASSWORD_VALIDATORS
        try:
            validate_password(password)
        except ValidationError as e:
            raise CommandError(f"Password validation failed: {'; '.join(e.messages)}")

        user = User.objects.filter(email=email).first()
        if user:
            user.role = User.Role.ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"[OK] Existing user '{email}' promoted to Administrator."))
        else:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                phone_number=phone,
                first_name=first_name,
                last_name=last_name,
                role=User.Role.ADMIN
            )
            self.stdout.write(self.style.SUCCESS(f"[OK] New Administrator account '{email}' successfully created."))
