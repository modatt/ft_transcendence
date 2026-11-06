from django.contrib import admin

# Register your models here.
from .models import Organization, Role, RolePermission, Permission

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'org_type', 'contact_email', 'tax_number')
    list_filter = ('org_type',)
    search_fields = ('name', 'contact_email', 'tax_number')
    readonly_fields = ('id',) # Prevent accidental editing of the primary key

@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'module', 'description')
    list_filter = ('module',)
    search_fields = ('code', 'description')
    readonly_fields = ('id',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'code', 'category', 'organization', 'is_system')
    list_filter = ('category', 'is_system', 'organization')
    search_fields = ('name', 'code')
    readonly_fields = ('id',)

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'role', 'permission')
    list_filter = ('role', )
    search_fields = ('role__name', 'permission__code') # go to related table__column search for column 
    readonly_fields = ('id', )

