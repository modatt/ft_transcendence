from django.contrib import admin

# Register your models here.
from .models import Organization

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'org_type', 'contact_email', 'tax_number')
    list_filter = ('org_type',)
    search_fields = ('name', 'contact_email', 'tax_number')
    readonly_fields = ('id',) # Prevent accidental editing of the primary key