from django.conf import settings
from django.db import models


class ClientOrganization(models.Model):
    """A school / club / company that is a CUSTOMER of the lab (not the tenant itself)."""

    class Type(models.TextChoices):
        SCHOOL = "school", "School"
        UNIVERSITY = "university", "University"
        CLUB = "club", "Club"
        COMPANY = "company", "Company"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="client_organizations",
    )
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=15, choices=Type.choices)
    contact_email = models.EmailField(max_length=255, null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)  # E.164
    address = models.CharField(max_length=255, null=True, blank=True)
    tax_number = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "name"], name="uq_clientorg_tenant_name"
            )
        ]

    def __str__(self):
        return self.name


class ClientMembership(models.Model):
    """Links a user to a client organization (school, club...)."""

    class Role(models.TextChoices):
        MEMBER = "member", "Member"
        SUPERVISOR = "supervisor", "Supervisor"
        BILLING_CONTACT = "billing_contact", "Billing contact"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="client_memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="client_memberships",
    )
    client_organization = models.ForeignKey(
        ClientOrganization, on_delete=models.CASCADE, related_name="memberships",
    )
    role = models.CharField(max_length=15, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "client_organization"], name="uq_membership_user_client"
            )
        ]

    def __str__(self):
        return f"{self.user_id} -> {self.client_organization_id} ({self.role})"