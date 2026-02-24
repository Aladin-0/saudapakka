from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFloorPlan
from apps.users.serializers import UserSerializer, PublicUserSerializer

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_thumbnail']

class PropertyFloorPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFloorPlan
        fields = ['id', 'image', 'floor_number', 'floor_name', 'order', 'created_at']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    floor_plans = PropertyFloorPlanSerializer(many=True, read_only=True)
    owner_details = PublicUserSerializer(source='owner', read_only=True)
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    furnishing_status_display = serializers.CharField(source='get_furnishing_status_display', read_only=True)
    availability_status_display = serializers.CharField(source='get_availability_status_display', read_only=True)
    listed_by_display = serializers.CharField(source='get_listed_by_display', read_only=True)
    facing_display = serializers.CharField(source='get_facing_display', read_only=True)
    sub_type_display = serializers.CharField(source='get_sub_type_display', read_only=True)
    has_7_12 = serializers.SerializerMethodField()
    has_mojani = serializers.SerializerMethodField()
    has_active_mandate = serializers.SerializerMethodField()
    active_mandate_id = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'owner', 'owner_details', 'title', 'description', 'listing_type', 'project_name', 'property_type',
            'property_type_display', 'sub_type', 'sub_type_display', 'verification_status', 'created_at',
            'bhk_config', 'bathrooms', 'balconies', 'furnishing_status', 'furnishing_status_display',
            'total_price', 'price_per_sqft', 'maintenance_charges', 'maintenance_interval', 'super_builtup_area', 
            'carpet_area', 'plot_area', 'address_line', 'locality', 'city', 'pincode', 'latitude', 'longitude', 
            'landmarks', 'specific_floor', 'total_floors', 'facing', 'facing_display', 'availability_status', 
            'availability_status_display', 'possession_date', 'age_of_construction', 'has_power_backup', 'has_lift', 
            'has_swimming_pool', 'has_club_house', 'has_gym', 'has_park', 'has_reserved_parking', 'has_security',
            'is_vastu_compliant', 'has_intercom', 'has_piped_gas', 'has_wifi', 'images', 'video_url', 'floor_plan', 
            'floor_plans', 'whatsapp_number', 'listed_by', 'listed_by_display', 'building_commencement_certificate',
            'building_completion_certificate', 'layout_sanction', 'layout_order', 'na_order_or_gunthewari',
            'mojani_nakasha', 'doc_7_12_or_pr_card', 'title_search_report', 'has_7_12', 'has_mojani', 
            'has_active_mandate', 'active_mandate_id', 'is_saved', 'views_count', 'rera_project_certificate',
            'gst_registration', 'sale_deed_registration_copy', 'electricity_bill', 'sale_deed']
        read_only_fields = ['id', 'owner', 'verification_status', 'created_at']

    def get_has_7_12(self, obj):
        return bool(obj.doc_7_12_or_pr_card)

    def get_has_mojani(self, obj):
        return bool(obj.mojani_nakasha)

    def get_has_active_mandate(self, obj):
        from apps.mandates.models import Mandate
        return Mandate.objects.filter(property_item=obj, status__in=['ACTIVE', 'PENDING']).exists()

    def get_active_mandate_id(self, obj):
        from apps.mandates.models import Mandate
        mandate = Mandate.objects.filter(property_item=obj, status__in=['ACTIVE', 'PENDING']).first()
        return str(mandate.id) if mandate else None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import SavedProperty
            return SavedProperty.objects.filter(user=request.user, property=obj).exists()
        return False

class AdminPropertySerializer(PropertySerializer):
    owner_details = UserSerializer(source='owner', read_only=True)

class ExternalPropertySerializer(serializers.ModelSerializer):
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = ['id', 'title', 'description', 'property_type', 'uploaded_images']

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        validated_data['owner'] = self.context['request'].user
        
        try:
            property_instance = Property.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Failed to create property: {str(e)}")

        for image in uploaded_images:
            PropertyImage.objects.create(property=property_instance, image=image)

        return property_instance
