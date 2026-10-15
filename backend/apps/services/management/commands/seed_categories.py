from django.core.management.base import BaseCommand
from apps.services.models import ServiceCategory

CATEGORIES = [
    {
        'slug': 'plumbing',
        'name': 'Plumbing Services',
        'trade_key': ServiceCategory.TradeKey.PLUMBER,
        'description': 'Leak detection, pipe repairs, drainage, fixture installations, and water heater servicing.',
        'icon_name': 'Wrench',
        'display_order': 1,
    },
    {
        'slug': 'electrical',
        'name': 'Electrical Work',
        'trade_key': ServiceCategory.TradeKey.ELECTRICIAN,
        'description': 'Circuit breaker panels, wiring diagnostics, lighting, and electrical fixture installations.',
        'icon_name': 'Zap',
        'display_order': 2,
    },
    {
        'slug': 'carpentry',
        'name': 'Carpentry & Woodwork',
        'trade_key': ServiceCategory.TradeKey.CARPENTER,
        'description': 'Cabinetry, door fitting, wood framing, furniture restoration, and structural wood repairs.',
        'icon_name': 'Hammer',
        'display_order': 3,
    },
    {
        'slug': 'painting',
        'name': 'Painting & Finishing',
        'trade_key': ServiceCategory.TradeKey.PAINTER,
        'description': 'Interior and exterior painting, surface prep, wall patching, and weather-resistant finishes.',
        'icon_name': 'Paintbrush',
        'display_order': 4,
    },
    {
        'slug': 'construction',
        'name': 'Masonry & Construction',
        'trade_key': ServiceCategory.TradeKey.BUILDER,
        'description': 'Bricklaying, concrete repair, wall reinforcement, floor tiling, and plastering.',
        'icon_name': 'HardHat',
        'display_order': 5,
    },
    {
        'slug': 'cleaning',
        'name': 'Deep Cleaning & Sanitization',
        'trade_key': ServiceCategory.TradeKey.CLEANER,
        'description': 'Post-construction cleanup, full home sanitization, window washing, and deep carpet cleaning.',
        'icon_name': 'Sparkles',
        'display_order': 6,
    },
]

class Command(BaseCommand):
    help = 'Seeds initial core trade service categories into the database.'

    def handle(self, *args, **options):
        count = 0
        for item in CATEGORIES:
            obj, created = ServiceCategory.objects.update_or_create(
                slug=item['slug'],
                defaults=item
            )
            if created:
                count += 1
                self.stdout.write(self.style.SUCCESS(f"Created category: {obj.name}"))
            else:
                self.stdout.write(f"Updated category: {obj.name}")

        self.stdout.write(self.style.SUCCESS(f"Successfully processed {len(CATEGORIES)} categories ({count} created)."))
