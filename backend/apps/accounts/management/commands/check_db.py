import sys
from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError, DatabaseError
from django.conf import settings

class Command(BaseCommand):
    help = 'Tests and verifies database connection health and SSL configuration before migrations.'

    def handle(self, *args, **options):
        db_config = settings.DATABASES.get('default', {})
        engine = db_config.get('ENGINE', '')
        name = db_config.get('NAME', '')
        host = db_config.get('HOST', 'localhost')
        port = db_config.get('PORT', '5432')
        user = db_config.get('USER', '')
        ssl_mode = db_config.get('OPTIONS', {}).get('sslmode', 'None')

        # Mask user if it is long
        masked_user = (user[:12] + '...') if len(user) > 16 else user

        self.stdout.write(self.style.NOTICE("============================================================"))
        self.stdout.write(self.style.NOTICE(" TEGAGN DATABASE CONNECTION VERIFICATION"))
        self.stdout.write(self.style.NOTICE("============================================================"))
        self.stdout.write(f"  Engine:       {engine}")
        self.stdout.write(f"  Host:         {host if host else '(local)'}")
        self.stdout.write(f"  Port:         {port if port else '(default)'}")
        self.stdout.write(f"  Database:     {name}")
        self.stdout.write(f"  User:         {masked_user if masked_user else '(default)'}")
        self.stdout.write(f"  Password:     [PROTECTED IN .env - NEVER LOGGED]")
        self.stdout.write(f"  SSL Mode:     {ssl_mode}")
        self.stdout.write(self.style.NOTICE("------------------------------------------------------------"))
        self.stdout.write("Attempting connection to database server...")

        try:
            # 1. Establish connection
            connection.ensure_connection()

            # 2. Execute verification query appropriate for the engine
            is_postgres = 'postgresql' in engine

            with connection.cursor() as cursor:
                if is_postgres:
                    cursor.execute("SELECT version();")
                    version_raw = cursor.fetchone()[0]
                    version_summary = version_raw.splitlines()[0]

                    cursor.execute("SELECT current_database(), current_user;")
                    active_db, active_user = cursor.fetchone()
                else:
                    cursor.execute("SELECT sqlite_version();")
                    version_summary = f"SQLite {cursor.fetchone()[0]}"
                    active_db = name
                    active_user = "local"

            # 3. Check SSL status on connection
            ssl_active = False
            raw_conn = getattr(connection, 'connection', None)
            if raw_conn is not None:
                if hasattr(raw_conn, 'ssl_in_use'):
                    ssl_active = bool(raw_conn.ssl_in_use)
                elif hasattr(raw_conn, 'info') and hasattr(raw_conn.info, 'ssl_in_use'):
                    ssl_active = bool(raw_conn.info.ssl_in_use)

            ssl_text = "ENCRYPTED (SSL Active)" if ssl_active else ("Required by config" if ssl_mode == 'require' else "Disabled")

            self.stdout.write(self.style.SUCCESS("\n[OK] CONNECTION SUCCESSFUL!"))
            self.stdout.write(f"  Connected DB:         {active_db}")
            self.stdout.write(f"  Authenticated User:   {active_user}")
            self.stdout.write(f"  Server Version:       {version_summary}")
            self.stdout.write(f"  Transport Security:   {ssl_text}")
            self.stdout.write(self.style.SUCCESS("------------------------------------------------------------"))
            self.stdout.write(self.style.SUCCESS("Database is reachable. Safe to run: 'python manage.py migrate'"))
            self.stdout.write(self.style.NOTICE("============================================================\n"))

        except OperationalError as exc:
            error_msg = str(exc)
            self.stdout.write(self.style.ERROR("\n[FAILED] DATABASE CONNECTION COULD NOT BE ESTABLISHED!"))
            self.stdout.write(self.style.ERROR(f"Details: {error_msg}"))
            self.stdout.write(self.style.NOTICE("\nSUPABASE TROUBLESHOOTING CHECKLIST:"))

            if "password authentication failed" in error_msg.lower():
                self.stdout.write("  1. Verify the Database Password set in Supabase Settings -> Database.")
                self.stdout.write("     Note: This is NOT your Supabase website account login password.")
                self.stdout.write("  2. If your password contains special characters (@, #, :, /, etc.),")
                self.stdout.write("     ensure they are URL-encoded if using DATABASE_URL.")
            elif "could not translate host name" in error_msg.lower():
                self.stdout.write("  1. Check your internet connection.")
                self.stdout.write("  2. Verify the host domain matches your Supabase Project Reference.")
            elif "connection refused" in error_msg.lower():
                self.stdout.write("  1. Verify port (5432 for Direct/Session or 6543 for Transaction Pooler).")
                self.stdout.write("  2. Check if your Supabase project is active or paused due to inactivity.")
            elif "ssl" in error_msg.lower() or "pg_hba" in error_msg.lower():
                self.stdout.write("  1. Supabase enforces SSL encryption in transit.")
                self.stdout.write("  2. Ensure sslmode=require is set in your connection string.")
            else:
                self.stdout.write("  1. Copy the Connection String URI from Supabase: Project Settings -> Database.")
                self.stdout.write("  2. Set DATABASE_URL in backend/.env.")

            self.stdout.write(self.style.NOTICE("============================================================\n"))
            sys.exit(1)

        except DatabaseError as exc:
            self.stdout.write(self.style.ERROR(f"\n[ERROR] Database error: {exc}"))
            sys.exit(1)
