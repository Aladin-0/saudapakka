from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.users.serializers import UserSerializer
from apps.properties.models import Property
from apps.users.models import KYCVerification

User = get_user_model()

class AdminUserDetailSerializer(UserSerializer):
    """
    Enhanced User Serializer for Admin View.
    Includes registration stats, property counts, and detailed KYC info.
    """
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    properties_count = serializers.SerializerMethodField()
    kyc_details = serializers.SerializerMethodField()
    # We can also start returning a list of properties here if needed, 
    # but maybe separate API call is better for pagination? 
    # For now, let's include the count and maybe top 5 recent properties?
    recent_properties = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'date_joined', 
            'last_login', 
            'properties_count',
            'kyc_details',
            'recent_properties'
        ]
        read_only_fields = UserSerializer.Meta.read_only_fields + ['date_joined', 'last_login']

    def get_properties_count(self, obj):
        return Property.objects.filter(owner=obj).count()

    def get_kyc_details(self, obj):
        try:
            kyc = KYCVerification.objects.get(user=obj)
            return {
                "status": kyc.status,
                "verified_at": kyc.verified_at,
                "verified_by": kyc.verified_by,
                "full_name_on_record": kyc.full_name,
                "verification_method": kyc.verified_by # e.g. 'DIGILOCKER' or 'ADMIN_MANUAL' or 'AUTO_UPLOAD'
            }
        except KYCVerification.DoesNotExist:
            return None

    def get_recent_properties(self, obj):
        # Return top 5 recent properties
        props = Property.objects.filter(owner=obj).order_by('-created_at')[:5]
        # Return simplified data
        return [
            {
                "id": p.id,
                "title": p.title,
                "total_price": p.total_price,
                "verification_status": p.verification_status,
                "created_at": p.created_at,
                "views_count": p.views_count
            }
            for p in props
        ]

class APIKeySerializer(serializers.Serializer):
    """
    Serializer for ExternalAPIKey model.
    """
    id = serializers.IntegerField(read_only=True)
    user_id = serializers.UUIDField(source='user.id', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    name = serializers.CharField()
    key = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

