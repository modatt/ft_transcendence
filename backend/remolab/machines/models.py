import secrets
from django.conf import settings
from django.db import models


def generate_qr_token():
    return secrets.token_urlsafe(24)


class MachineType(models.Model):
    class Category(models.TextChoices):
        PRINTING_3D = "3d_printing", "3D printing"
        LASER_CUTTING = "laser_cutting", "Laser cutting"
        VINYL_CUTTING = "vinyl_cutting", "Vinyl cutting"
        CNC_MILLING = "cnc_milling", "CNC milling"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="machine_types",
    )
    name = models.CharField(max_length=60)
    name_local = models.CharField(max_length=60, null=True, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.CharField(max_length=255, null=True, blank=True)
    min_age = models.PositiveSmallIntegerField()
    requires_license = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="uq_machinetype_tenant_name"
            )
        ]

    def __str__(self):
        return self.name


class Machine(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        BUSY = "busy", "Busy"
        MAINTENANCE = "maintenance", "Maintenance"
        OFFLINE = "offline", "Offline"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="machines",
    )
    machine_type = models.ForeignKey(
        MachineType, on_delete=models.PROTECT, related_name="machines"
    )
    name = models.CharField(max_length=40)
    model = models.CharField(max_length=80)
    serial_number = models.CharField(max_length=40, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.AVAILABLE
    )
    hourly_rate = models.DecimalField(max_digits=12, decimal_places=3)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    api_endpoint = models.CharField(max_length=255, null=True, blank=True)
    qr_token = models.CharField(
        max_length=40, unique=True, default=generate_qr_token, editable=False
    )
    location = models.CharField(max_length=60, null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="uq_machine_tenant_name"
            ),
            models.UniqueConstraint(
                fields=["organization", "ip_address"], name="uq_machine_tenant_ip"
            ),
            models.CheckConstraint(
                check=models.Q(hourly_rate__gte=0), name="ck_machine_rate_nonneg"
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"


class Material(models.Model):
    """Raw materials (filament, resin, sheets) used by machines."""
    
    class MaterialType(models.TextChoices):
        FILAMENT = "filament", "Filament"
        RESIN = "resin", "Resin"
        SHEET = "sheet", "Sheet"
        ROLL = "roll", "Roll"

    class UnitOfMeasure(models.TextChoices):
        G = "g", "Grams (g)"
        ML = "ml", "Milliliters (ml)"
        SHEET = "sheet", "Sheet"
        M = "m", "Meters (m)"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="materials"
    )
    name = models.CharField(max_length=80)
    material_type = models.CharField(max_length=12, choices=MaterialType.choices)
    unit_of_measure = models.CharField(max_length=6, choices=UnitOfMeasure.choices)
    stock_quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=4)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="uq_material_tenant_name"
            )
        ]

    def __str__(self):
        return self.name


class MachineMaterial(models.Model):
    """Which material is loaded in which machine, and how much."""

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="machine_materials",
    )
    machine = models.ForeignKey(
        Machine, on_delete=models.CASCADE, related_name="loaded_materials"
    )
    material = models.ForeignKey(
        Material, on_delete=models.PROTECT, related_name="machine_loads"
    )
    loaded_quantity = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["machine", "material"], name="uq_machinematerial_machine_material"
            )
        ]


class PrintPreset(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="print_presets",
    )
    machine_type = models.ForeignKey(
        MachineType, on_delete=models.CASCADE, related_name="presets"
    )
    name = models.CharField(max_length=80)
    settings = models.JSONField(default=dict)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class License(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        REVOKED = "revoked", "Revoked"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="licenses",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="licenses"
    )
    machine_type = models.ForeignKey(
        MachineType, on_delete=models.PROTECT, related_name="licenses"
    )
    certificate_number = models.CharField(max_length=25, unique=True)
    issue_date = models.DateField()
    expiry_date = models.DateField()
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    issued_by_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name="licenses_issued",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "machine_type"], name="uq_license_user_machinetype"
            ),
            models.CheckConstraint(
                check=models.Q(expiry_date__gt=models.F("issue_date")),
                name="ck_license_expiry_after_issue",
            ),
        ]

    def __str__(self):
        return self.certificate_number