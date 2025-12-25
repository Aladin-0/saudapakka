from django.contrib import admin
from .models import Property, PropertyImage

# This allows you to add images directly inside the Property page
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    # Columns to show in the list view
    list_display = ('title', 'verification_status', 'price', 'property_type', 'owner')
    
    # Sidebar filters
    list_filter = ('verification_status', 'property_type', 'listing_type')
    
    # Search bar configuration
    search_fields = ('title', 'address_line', 'owner__email', 'owner__full_name')
    
    # CRITICAL FIX: Make 'embedding' read-only.
    # This prevents the Admin from trying to save the text "[]" into the vector field.
    readonly_fields = ('embedding', 'created_at', 'updated_at')
    
    # Add the image uploader inline
    inlines = [PropertyImageInline]

# Keep this simple
admin.site.register(PropertyImage)