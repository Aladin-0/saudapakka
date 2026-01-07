from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, KYCVerification, BrokerProfile

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'phone_number', 'is_active_seller', 'is_active_broker')
    list_editable = ('is_active_seller', 'is_active_broker')
    search_fields = ('email', 'phone_number', 'first_name', 'last_name')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('SaudaPakka Roles', {'fields': ('is_active_seller', 'is_active_broker')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.register(KYCVerification)
admin.site.register(BrokerProfile)