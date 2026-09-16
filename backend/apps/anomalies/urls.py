from django.urls import path
from .views import AnomalyListView, AnomalyActionView

urlpatterns = [
    path('', AnomalyListView.as_view(), name='anomaly_list'),
    path('<uuid:pk>/', AnomalyActionView.as_view(), name='anomaly_action'),
]
