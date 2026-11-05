from decimal import ROUND_HALF_UP, Decimal
from django.conf import settings
from django.db import models

MONEY = Decimal("0.001")  # DECIMAL(12,3)


class Job(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        QUOTED = "quoted", "Quoted"
        PENDING_APPROVAL = "pending_approval", "Pending approval"
        QUEUED = "queued", "Queued"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"

    class InputMode(models.TextChoices):
        UPLOAD_READY = "upload_ready", "Upload ready (sliced file + settings)"
        CONFIGURE_IN_APP = "configure_in_app", "Configure in app"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE, related_name="jobs"
    )
    job_number = models.CharField(max_length=16)  # JOB-YYYY-NNNN
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="jobs"
    )
    machine = models.ForeignKey(
        "machines.Machine", on_delete=models.PROTECT, related_name="jobs"
    )
    material = models.ForeignKey(
        "machines.Material", on_delete=models.PROTECT, null=True, blank=True,
        related_name="jobs",
    )
    print_preset = models.ForeignKey(
        "machines.PrintPreset", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="jobs",
    )
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.DRAFT
    )
    input_mode = models.CharField(max_length=16, choices=InputMode.choices)
    requirements = models.JSONField(default=dict)

    accepted_quote = models.ForeignKey(
        "JobQuote", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="accepted_for_jobs",
    )
    approved_by_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="jobs_approved",
    )
    guardian_approved_at = models.DateTimeField(null=True, blank=True)
    attended_by_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="jobs_attended",
    )

    queued_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    actual_duration_min = models.PositiveIntegerField(null=True, blank=True)
    actual_material_qty = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    failure_reason = models.CharField(max_length=80, null=True, blank=True)
    machine_job_ref = models.CharField(max_length=30, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "job_number"], name="uq_job_tenant_number"
            ),
            models.CheckConstraint(
                check=~models.Q(status="failed") | models.Q(failure_reason__isnull=False),
                name="ck_job_failed_needs_reason",
            ),
        ]
        indexes = [
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["machine", "status"]),
        ]

    def __str__(self):
        return self.job_number


class JobQuote(models.Model):
    class Status(models.TextChoices):
        OFFERED = "offered", "Offered"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"
        SUPERSEDED = "superseded", "Superseded"
        EXPIRED = "expired", "Expired"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="job_quotes",
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="quotes")
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.OFFERED
    )
    estimated_duration_min = models.PositiveIntegerField()
    estimated_material_qty = models.DecimalField(max_digits=10, decimal_places=2)

    machine_rate = models.DecimalField(max_digits=12, decimal_places=3)
    material_unit_price = models.DecimalField(max_digits=10, decimal_places=4)

    machine_time_cost = models.DecimalField(max_digits=12, decimal_places=3)
    material_cost = models.DecimalField(max_digits=12, decimal_places=3)
    subtotal = models.DecimalField(max_digits=12, decimal_places=3)
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=3, default=Decimal("0")
    )
    tax_rate = models.DecimalField(max_digits=5, decimal_places=4)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=3)
    total_amount = models.DecimalField(max_digits=12, decimal_places=3)

    currency = models.CharField(max_length=3)
    offered_at = models.DateTimeField()
    valid_until = models.DateTimeField()
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["job", "version"], name="uq_jobquote_job_version"
            )
        ]

    def compute_totals(self):
        hours = (Decimal(self.estimated_duration_min) / 60).quantize(
            Decimal("0.01"), ROUND_HALF_UP
        )
        self.machine_time_cost = (hours * self.machine_rate).quantize(MONEY, ROUND_HALF_UP)
        self.material_cost = (
            self.estimated_material_qty * self.material_unit_price
        ).quantize(MONEY, ROUND_HALF_UP)
        self.subtotal = self.machine_time_cost + self.material_cost
        taxable = self.subtotal - self.discount_amount
        self.tax_amount = (taxable * self.tax_rate).quantize(MONEY, ROUND_HALF_UP)
        self.total_amount = taxable + self.tax_amount

    def __str__(self):
        return f"{self.job_id} v{self.version}"


class JobFile(models.Model):
    class Role(models.TextChoices):
        MODEL = "model", "Model (STL)"
        SLICED = "sliced", "Sliced (G-code/3MF)"
        DESIGN = "design", "Design (SVG/DXF/NC)"

    class FileType(models.TextChoices):
        STL = "stl", "STL"
        THREE_MF = "3mf", "3MF"
        GCODE = "gcode", "G-code"
        SVG = "svg", "SVG"
        DXF = "dxf", "DXF"
        NC = "nc", "NC"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="job_files",
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="files")
    file_role = models.CharField(max_length=10, choices=Role.choices)
    file_name = models.CharField(max_length=120)
    file_url = models.CharField(max_length=400)
    file_type = models.CharField(max_length=8, choices=FileType.choices)
    file_size_kb = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


class JobStatusHistory(models.Model):
    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="job_status_history",
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="status_history")
    previous_status = models.CharField(
        max_length=16, choices=Job.Status.choices, null=True, blank=True
    )
    new_status = models.CharField(max_length=16, choices=Job.Status.choices)
    changed_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="job_status_changes",
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ["changed_at"]
        verbose_name_plural = "Job status history"


class MachineNotifyRequest(models.Model):
    """For the 'busy -> notify me' flow."""
    
    class Status(models.TextChoices):
        WAITING = "waiting", "Waiting"
        NOTIFIED = "notified", "Notified"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    organization = models.ForeignKey(
        "organizations.Organization", on_delete=models.CASCADE,
        related_name="machine_notify_requests"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="machine_notify_requests"
    )
    machine = models.ForeignKey(
        "machines.Machine", on_delete=models.CASCADE,
        related_name="notify_requests"
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name_plural = "Machine notify requests"

    def __str__(self):
        return f"Notify request for {self.machine.name} by {self.user_id}"