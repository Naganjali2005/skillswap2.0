from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = "api"

    def ready(self):
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()

            if not User.objects.filter(username="admin").exists():
                User.objects.create_superuser(
                    username="admin",
                    email="admin@example.com",
                    password="admin123"
                )
                print("Admin user created")
        except Exception as e:
            # Avoid crashing app on startup
            print("Admin creation skipped:", e)
