import os
try:
    from celery import Celery
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    app = Celery('findoc_platform')
    app.config_from_object('django.conf:settings', namespace='CELERY')
    app.autodiscover_tasks()
except ImportError:
    app = None


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Celery Debug Request: {self.request!r}')
