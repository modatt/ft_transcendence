from django.contrib import admin
from .models import Job, JobQuote, JobFile, JobStatusHistory, MachineNotifyRequest

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('job_number', 'organization', 'user', 'machine', 'status', 'created_at')
    list_filter = ('status', 'input_mode')
    search_fields = ('job_number', 'user__email')

@admin.register(JobQuote)
class JobQuoteAdmin(admin.ModelAdmin):
    list_display = ('job', 'version', 'status', 'total_amount', 'currency', 'offered_at')
    list_filter = ('status',)

@admin.register(JobFile)
class JobFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'job', 'file_role', 'file_type', 'uploaded_at')
    list_filter = ('file_role', 'file_type')

@admin.register(JobStatusHistory)
class JobStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('job', 'previous_status', 'new_status', 'changed_by_user', 'changed_at')
    list_filter = ('new_status',)

@admin.register(MachineNotifyRequest)
class MachineNotifyRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'machine', 'status', 'created_at', 'notified_at')
    list_filter = ('status',)
