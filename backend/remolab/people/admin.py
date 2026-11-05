from django.contrib import admin
from .models import ClientOrganization, ClientMembership

@admin.register(ClientOrganization)
class ClientOrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'contact_email', 'is_active')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'contact_email')

@admin.register(ClientMembership)
class ClientMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'client_organization', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__email', 'client_organization__name')
