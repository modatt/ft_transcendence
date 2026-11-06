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