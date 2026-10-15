from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse, HttpResponse
from rest_framework_simplejwt.views import TokenRefreshView

def health_check(request):
    return JsonResponse({
        "status": "healthy",
        "service": "Tegagn Home-Repair Marketplace API",
        "version": "1.0.0",
        "database": "connected"
    })

def api_root_gateway(request):
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tegagn Marketplace Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 580px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: #064e3b; color: #34d399; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
        .pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
        h1 { margin: 0 0 8px; font-size: 28px; color: #ffffff; }
        p { color: #94a3b8; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
        .btn-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .btn { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #ea580c; color: #ffffff; font-weight: 700; text-decoration: none; border-radius: 10px; transition: all 0.2s; font-size: 15px; }
        .btn:hover { background: #c2410c; transform: translateY(-1px); }
        .btn-secondary { background: #334155; color: #f8fafc; font-weight: 600; }
        .btn-secondary:hover { background: #475569; }
        .endpoints { border-top: 1px solid #334155; padding-top: 20px; font-size: 13px; color: #64748b; line-height: 1.8; }
        .endpoints a { color: #38bdf8; text-decoration: none; font-weight: 500; }
        .endpoints a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge"><span class="pulse"></span> Django Backend & API Live</div>
        <h1>Tegagn Marketplace Gateway</h1>
        <p>The Django REST Framework backend and PostgreSQL database are online and healthy.</p>
        
        <div class="btn-group">
            <a href="http://localhost:5173" class="btn">
                <span>🚀 Open React Web Application</span>
                <span>http://localhost:5173 →</span>
            </a>
            <a href="/admin/" class="btn btn-secondary">
                <span>🛡️ Django Administration Panel</span>
                <span>/admin/ →</span>
            </a>
            <a href="/api/v1/health/" class="btn btn-secondary">
                <span>🩺 API Health JSON Status</span>
                <span>/api/v1/health/ →</span>
            </a>
        </div>

        <div class="endpoints">
            <strong style="color: #cbd5e1;">Active REST Endpoints:</strong><br>
            • Workers Directory: <a href="/api/v1/workers/">/api/v1/workers/</a><br>
            • Service Categories: <a href="/api/v1/services/categories/">/api/v1/services/categories/</a><br>
            • Admin Stats: <a href="/api/v1/admin/stats/">/api/v1/admin/stats/</a>
        </div>
    </div>
</body>
</html>"""
    return HttpResponse(html_content)

urlpatterns = [
    # Gateway Root
    path('', api_root_gateway, name='api-root-gateway'),
    path('favicon.ico', lambda r: HttpResponse(status=204)),

    # Built-in Admin & Health Check
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check, name='api-health'),
    
    # SimpleJWT Token Refresh
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Modular App Endpoints
    path('api/v1/auth/', include('apps.accounts.urls', namespace='accounts')),
    path('api/v1/workers/', include('apps.workers.urls', namespace='workers')),
    path('api/v1/services/', include('apps.services.urls', namespace='services')),
    path('api/v1/bookings/', include('apps.bookings.urls', namespace='bookings')),
    path('api/v1/reviews/', include('apps.reviews.urls', namespace='reviews')),
    path('api/v1/admin/', include('apps.administration.urls', namespace='administration')),
]
