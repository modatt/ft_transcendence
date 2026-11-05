from django.contrib import admin
from .models import MachineType, Machine, Material, MachineMaterial, PrintPreset, License

@admin.register(MachineType)
class MachineTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'min_age', 'requires_license', 'is_active')
    list_filter = ('category', 'requires_license')

@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('name', 'machine_type', 'status', 'hourly_rate', 'location')
    list_filter = ('status', 'machine_type')
    search_fields = ('name', 'serial_number')

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'material_type', 'stock_quantity', 'unit_price', 'is_active')
    list_filter = ('material_type', 'is_active')

@admin.register(MachineMaterial)
class MachineMaterialAdmin(admin.ModelAdmin):
    list_display = ('machine', 'material', 'loaded_quantity')

@admin.register(PrintPreset)
class PrintPresetAdmin(admin.ModelAdmin):
    list_display = ('name', 'machine_type', 'is_default')
    list_filter = ('machine_type', 'is_default')

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'user', 'machine_type', 'status', 'expiry_date')
    list_filter = ('status', 'machine_type')
    search_fields = ('certificate_number', 'user__email')
