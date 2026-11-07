from django.db import models
from django.core.validators import RegexValidator

class OrganizationType(models.TextChoices):
    """Enum for Organization Types"""
    COMPANY = 'COMPANY', 'Company'
    NON_PROFIT = 'NON_PROFIT', 'Non-Profit'
    GOVERNMENT = 'GOVERNMENT', 'Government Entity'
    EDUCATIONAL = 'EDUCATIONAL', 'Educational Institution'
    INDIVIDUAL = 'INDIVIDUAL', 'Individual / Freelancer'

class Organization(models.Model):
    # 1. ID: Django adds this automatically as a BigAutoField, 
    # but we can define it explicitly for clarity.
    id = models.BigAutoField(primary_key=True, verbose_name="ID")
    
    # 2. Name: String
    name = models.CharField(
        max_length=255, 
        verbose_name="Organization Name"
    )
    
    # 3. Type: Enum of string 
    # (Note: 'type' is a reserved keyword in Python, so 'org_type' is the standard convention)
    org_type = models.CharField(
        max_length=50,
        choices=OrganizationType.choices,
        default=OrganizationType.COMPANY,
        verbose_name="Organization Type"
    )
    
    # 4. Contact Email: String (with built-in email validation)
    contact_email = models.EmailField(
        max_length=255,
        blank=True, 
        null=True,
        verbose_name="Contact Email"
    )
    
    # 5. Contact Phone: String (with optional regex validation for formatting)
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    contact_phone = models.CharField(
        max_length=20,
        validators=[phone_validator],
        blank=True,
        null=True,
        verbose_name="Contact Phone"
    )
    
    # 6. Address: String (TextField is better than CharField for multi-line addresses)
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name="Physical Address"
    )
    
    # 7. Tax Number: CharField (Industry Standard)
    # If you STRICTLY need an integer, replace this line with:
    # tax_number = models.PositiveBigIntegerField(blank=True, null=True, unique=True, verbose_name="Tax Number")
    tax_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True, # Tax numbers should be unique per organization
        verbose_name="Tax Number / VAT ID"
    )

    class Meta:
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ['name'] # Default sorting in admin/queries

    def __str__(self):
        return f"{self.name} ({self.get_org_type_display()})"

class OrganizationSetting(models.Model):
    """
    """
    # organization_id: PK, FK, to Organization.id (1:1 with Organization)
    organization_id = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name="Organization ID"
    )

    # currency: CHAR(3), No
    currency = models.CharField(
        max_length=3, 
        verbose_name="Currency"
        help_text="ISO currency of every price and invoice of this lab",
    )

    # currency_decimals: INT, No
    currency_decimals = models.PositiveBigIntegerField(
        verbose_name="Curreny Decimals",
        help_text="Rounding digits: JOD 3, EUR 2, CAD 2",
    )

    # tax_rate: DeCIMAL(5, 4), No
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        verbose_name="Tax Rate",
        help_text="Default sales tax/ VAT",
    )

    # student_discount_pct: DECIMAL(5,4), No
    student_discount_pct = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        verbose_name="Student Discount (%)",
        help_text="Discount for role = student",
    )
    
    # timezone: VARCHAR(40), No
    timezone = models.CharField(
        max_length=40,
        verbose_name="Timezone",
        help_text="IANA timezoe; timestamps stored UTC, shown in this zone",
    )

    default_locale = models.CharField(
        max_length=2,
        verbose_name="Default Locale",
        help_text="Default UI language",
    )

    # weekend_days: VARCHAR(20), No
    weekend_days = models.CharField(
        max_length=20,
        verbose_name="Weekend Days",
        help_text="e.g. fri,sat (Jordan) or sat,sun",
    )

    # opening_time: TIME, No
    opening_time = models.TimeField(
        verbose_name="Opening Time",
    )

    # closing_time: TIME, No
    closing_time = models.TimeField(
        verbose_name="Closing Time",
    )

    # independent_use_age: INT, No
    independent_use_age = models.PositiveSmallIntegerField(
        verbose_name="Independent Use Age",
        help_text="Below this age staff approval is required (flow: 16)",
    )

    # license_validity_months: INT, No
    license_validity_months = models.PositiveIntegerField(
        verbose_name="License Validity (Months)",
        help_text="Default licence validity",
    )

    # quote_validity_min: INT, No
    quote_validity_min = models.PositiveIntegerField(
        verbose_name="Quote Validity (Minutes)",
        help_text="Minutes a price quote stays valid",
    )

    # invoice_due_days: INT, No
    invoice_due_days = models.PositiveIntegerField(
        verbose_name="Invoice Due Days",
        help_text="Days between issue and due date",
    )

    # invoice_prefix: VARCHAR(6), No
    invoice_prefix = models.CharField(
        max_length=6,
        verbose_name="Invoice Prefix",
        help_text="Invoice number prefix",
    )

    class Meta:
        verbose_name = "Organization Setting"
        verbose_name_plural = "Organization Settings"

    def __str__(self):
        return f"Settings for {self.organization.name}"

# modat: Role, RolePermission, Permission tables.

## Permission Table
class Permission(models.Model):
    id = models.BigAutoField(primary_key=True, verbose_name="ID")

    code = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Permission Code"
    )

    module = models.CharField(
        max_length=50,
        verbose_name="Module Name"
    )

    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ['module', 'code']

    def __str__(self):
        return f"{self.module}: {self.code}" # will be displayed as "machines: machine.view"

##  Role 

class Role(models.Model):
    id = models.BigAutoField(primary_key=True, verbose_name="ID")
   
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE
    )
    code = models.CharField(
        max_length=100,
        verbose_name="Role Code"
    )

    name = models.CharField(
       max_length=100,
       verbose_name="Role Name"
    )

    category = models.CharField(
       max_length=50,
       blank=True,
       verbose_name="Category"
    )

    description = models.TextField(
       blank=True,
       verbose_name="Description"
    )

    is_system = models.BooleanField(
       default=False,
       verbose_name="Is System Role"
    )
    
    class Meta:
       verbose_name = "Role"
       verbose_name_plural = "Roles"
       ordering = ['category', 'name']
    
    def __str__(self):
       return f"{self.name} ({self.code})"

## RolePermission
class RolePermission(models.Model):
    id = models.BigAutoField(primary_key=True, verbose_name="ID")

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE
    ) 

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = "Role Permission"
        verbose_name_plural = "Role Permissions"
        ordering = ['id']
        unique_together = ('role', 'permission') # Prevents duplicate links

    def __str__(self):
        return f"{self.role}-> ({self.permission})"