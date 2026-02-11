'use client';

import React, { useMemo } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

export const CONSTANTS = {
    BRAND_NAME: 'SAUDAPAKKA',
    WEBSITE: 'WWW.SAUDAPAKKA.COM',
    WEBSITE_DISPLAY: 'SAUDAPAKKA.COM',
    TAGLINE: 'Trusted Property Platform'
} as const;

const contains = (str: string | undefined, term: string) =>
    (str || '').toLowerCase().includes(term.toLowerCase());

// ============================================================================
// TYPES
// ============================================================================

export interface MarketingPropertyInput {
    // Basic Info
    id?: string | number;
    title?: string;
    property_name?: string;
    description?: string;
    about?: string;

    // Location
    locality?: string;
    area?: string | number;
    city?: string;

    // Configuration
    bedrooms?: number | string;
    bhk_type?: number | string;
    bathrooms?: number | string;
    bath?: number | string;
    balconies?: number | string;

    // Area
    carpet_area?: number | string;
    area_sqft?: number | string;
    built_up_area?: number | string;

    // Price
    total_price?: number | string;
    price?: number | string;
    expected_price?: number | string;
    negotiable?: boolean;

    // Classification
    property_type?: string;
    status?: string;
    furnished_status?: string;
    furnishing?: string;
    parking?: string;
    parking_available?: string;

    // Media & Contact
    images?: Array<string | { image: string }>;
    contact_number?: string;
    owner_phone?: string;
    phone?: string;
}

export interface RichTemplateProps {
    property: MarketingPropertyInput;
    templateStyle: 'elegant' | 'urban' | 'nature' | 'prestige' | 'minimal';
    id?: string;
}

interface PropertyData {
    title: string;
    locality: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    carpet_area: number;
    price: number;
    contact: string;
    furnished: string;
    parking: string;
    description: string;
    property_type: string;
    images: string[];
    status: string;
    negotiable: boolean;
    balconies?: number;
    isPlot: boolean;
}

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    light: string;
    gradient: string;
    name: string;
    description: string;
}

// ============================================================================
// IMPROVED COLOR THEMES (2026 Standards)
// ============================================================================

const COLORS: Record<string, ThemeColors> = {
    // Theme 1: Elegant Warmth - Sophisticated terracotta & cream
    elegant: {
        name: 'Elegant Warmth',
        description: 'Perfect for family homes and premium apartments',
        primary: '#C77D58',      // Warm terracotta
        secondary: '#2D3E45',    // Deep charcoal
        accent: '#E8B298',       // Soft peach
        text: '#1A1A1A',
        light: '#FAF7F5',        // Warm cream
        gradient: 'linear-gradient(135deg, #C77D58 0%, #E8B298 100%)'
    },

    // Theme 2: Urban Professional - Modern navy & gold
    urban: {
        name: 'Urban Professional',
        description: 'Ideal for commercial and luxury properties',
        primary: '#1E3A5F',      // Rich navy
        secondary: '#D4A574',    // Muted gold
        accent: '#4A7BA7',       // Soft blue
        text: '#1F2937',
        light: '#F8FAFB',        // Cool white
        gradient: 'linear-gradient(135deg, #1E3A5F 0%, #4A7BA7 100%)'
    },

    // Theme 3: Nature Harmony - Organic sage & earth tones
    nature: {
        name: 'Nature Harmony',
        description: 'Best for eco-friendly and suburban homes',
        primary: '#7A9B76',      // Sage green
        secondary: '#4A5D4E',    // Forest green
        accent: '#B5C4A1',       // Light sage
        text: '#2C3E2D',
        light: '#F5F7F3',        // Natural white
        gradient: 'linear-gradient(135deg, #7A9B76 0%, #B5C4A1 100%)'
    },

    // Theme 4: Prestige Dark - Luxury black & champagne
    prestige: {
        name: 'Prestige',
        description: 'Ultimate luxury for high-end properties',
        primary: '#1A1A1A',      // Rich black
        secondary: '#D4AF6A',    // Champagne gold
        accent: '#8B7355',       // Bronze
        text: '#F5F5F5',
        light: '#2A2A2A',        // Charcoal
        gradient: 'linear-gradient(135deg, #D4AF6A 0%, #F5E6C8 100%)'
    },

    // Theme 5: Minimal Trust - Clean blue & white
    minimal: {
        name: 'Minimal Trust',
        description: 'Clean, trustworthy for all property types',
        primary: '#3B7EA1',      // Trust blue
        secondary: '#1A365D',    // Deep blue
        accent: '#7FA8BE',       // Sky blue
        text: '#1E293B',
        light: '#F8FAFC',        // Pure white
        gradient: 'linear-gradient(135deg, #3B7EA1 0%, #7FA8BE 100%)'
    }
};

const DEFAULT_IMAGES = {
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg=='
};

const TEMPLATE_STYLES = {
    container: {
        width: '1080px',
        height: '1080px',
        position: 'relative' as const,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || isNaN(numPrice) || numPrice === 0) return 'Price on Request';

    if (numPrice >= 10000000) {
        return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
        return `₹${(numPrice / 100000).toFixed(0)} Lakh`;
    } else {
        return `₹${numPrice.toLocaleString('en-IN')}`;
    }
};

const formatContact = (contact: string): string => {
    if (!contact) return '';
    const cleaned = contact.replace(/^\+91\s*/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return contact;
};

const getPropertyData = (property: MarketingPropertyInput): PropertyData => {
    const images = Array.isArray(property?.images)
        ? property.images.map((img) => typeof img === 'string' ? img : img?.image).filter((img): img is string => !!img)
        : [];

    const getInt = (val: number | string | undefined, defaultVal: number) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseInt(val) || defaultVal;
        return defaultVal;
    };

    const getFloat = (val: number | string | undefined, defaultVal: number) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val) || defaultVal;
        return defaultVal;
    };

    const isPlot = ['Plot', 'Land', 'Agricultural'].some(t => contains(property?.property_type, t));

    return {
        title: property?.title || property?.property_name || (isPlot ? 'Premium Plot' : 'Premium Property'),
        locality: property?.locality || (property?.area ? String(property.area) : undefined) || 'Prime Location',
        city: property?.city || 'Pune',
        bedrooms: isPlot ? 0 : getInt(property?.bedrooms || property?.bhk_type, 2),
        bathrooms: isPlot ? 0 : getInt(property?.bathrooms || property?.bath, 1),
        carpet_area: getInt(property?.carpet_area || property?.area_sqft || property?.built_up_area, 1200),
        price: getFloat(property?.total_price || property?.price || property?.expected_price, 0),
        contact: property?.contact_number || property?.owner_phone || property?.phone || '',
        furnished: property?.furnished_status || property?.furnishing || (isPlot ? '' : 'Semi-Furnished'),
        parking: property?.parking || property?.parking_available || (isPlot ? '' : 'Available'),
        description: property?.description || property?.about || '',
        property_type: property?.property_type || (isPlot ? 'Residential Plot' : 'Apartment'),
        images: images.length > 0 ? images : [DEFAULT_IMAGES.placeholder],
        status: property?.status || 'Ready to Move',
        negotiable: property?.negotiable || false,
        balconies: isPlot ? 0 : getInt(property?.balconies, 2),
        isPlot
    };
};

const getAmenities = (property: MarketingPropertyInput): string[] => {
    const data = getPropertyData(property);
    const amenities = [];

    if (!data.isPlot && data.furnished) amenities.push(data.furnished);
    if (!data.isPlot && data.parking && data.parking !== 'Not Available') amenities.push('Parking');
    if (!data.isPlot && data.balconies) amenities.push(`${data.balconies} Balconies`);

    if (data.isPlot) {
        amenities.push('Clear Title', 'Water Connection', 'Road Touch', 'Electricity', 'Security');
    } else {
        amenities.push('24×7 Water', 'Power Backup', 'Security');
    }

    return amenities.slice(0, 6);
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

const Watermark: React.FC<{ style?: React.CSSProperties; color?: string }> = ({
    style,
    color = 'rgba(255, 255, 255, 0.08)'
}) => (
    <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-12deg)',
        fontSize: '65px',
        fontWeight: 900,
        color,
        textShadow: '0 2px 8px rgba(0,0,0,0.08)',
        letterSpacing: '8px',
        zIndex: 5,
        pointerEvents: 'none',
        userSelect: 'none',
        ...style
    }}>
        {CONSTANTS.BRAND_NAME}
    </div>
);

const PropertyImage: React.FC<{
    src: string;
    alt: string;
    style?: React.CSSProperties;
    overlay?: boolean;
}> = ({ src, alt, style, overlay }) => (
    <>
        <img
            src={src}
            alt={alt}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                ...style
            }}
            crossOrigin="anonymous"
            loading="eager"
        />
        {overlay && (
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.25))'
            }} />
        )}
    </>
);

// ============================================================================
// THEME 1: ELEGANT WARMTH (Terracotta & Cream)
// ============================================================================

const ElegantTemplate: React.FC<{ property: MarketingPropertyInput; id?: string }> = ({ property, id }) => {
    const theme = COLORS.elegant;
    const data = useMemo(() => getPropertyData(property), [property]);
    const amenities = useMemo(() => getAmenities(property), [property]);

    return (
        <div id={id} style={{ ...TEMPLATE_STYLES.container, backgroundColor: theme.light }}>
            {/* Soft Header */}
            <div style={{
                padding: '35px 45px 25px',
                background: `linear-gradient(to bottom, ${theme.light}, rgba(250, 247, 245, 0))`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: theme.primary,
                    letterSpacing: '2px'
                }}>
                    {CONSTANTS.BRAND_NAME}
                </div>
                <div style={{
                    backgroundColor: theme.primary,
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '25px',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                }}>
                    ✓ VERIFIED LISTING
                </div>
            </div>

            {/* Main Layout */}
            <div style={{ padding: '0 45px 45px', display: 'flex', gap: '30px', height: 'calc(100% - 145px)' }}>
                {/* Left Column - Image */}
                <div style={{
                    flex: '1.3',
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 15px 45px rgba(199, 125, 88, 0.15)'
                }}>
                    <PropertyImage
                        src={data.images[0]}
                        alt={data.title}
                        overlay
                    />
                    <Watermark color="rgba(255, 255, 255, 0.12)" />

                    {/* Property Type Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: theme.secondary,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        {data.isPlot ? data.property_type : `${data.bedrooms} BHK ${data.property_type}`}
                    </div>

                    {/* Status Badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        right: '20px',
                        backgroundColor: 'rgba(45, 62, 69, 0.92)',
                        backdropFilter: 'blur(10px)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: 'white'
                    }}>
                        <span style={{ fontSize: '24px' }}>✨</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>Status</div>
                            <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.status}</div>
                        </div>
                        <div style={{
                            width: '1px',
                            height: '32px',
                            backgroundColor: 'rgba(255,255,255,0.2)'
                        }} />
                        <div>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>{data.isPlot ? 'Plot Area' : 'Carpet Area'}</div>
                            <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.carpet_area} sq.ft</div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Details */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Title & Location */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                    }}>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            color: theme.secondary,
                            margin: '0 0 12px 0',
                            lineHeight: 1.2
                        }}>
                            {data.isPlot ? 'Premium Plot' : `${data.bedrooms} BHK Premium Flat`}
                        </h1>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '17px',
                            color: '#6B7280',
                            fontWeight: 500
                        }}>
                            <span style={{ color: theme.primary, fontSize: '20px' }}>📍</span>
                            {data.locality}, {data.city}
                        </div>
                    </div>

                    {/* Property Specs */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '16px'
                        }}>
                            {(data.isPlot ? [
                                { icon: '📐', value: data.carpet_area, label: 'Plot Area' },
                                { icon: '📜', value: 'Clear', label: 'Title' },
                                { icon: '🛣️', value: 'Yes', label: 'Road Touch' }
                            ] : [
                                { icon: '🛏️', value: data.bedrooms, label: 'Bedrooms' },
                                { icon: '🚿', value: data.bathrooms, label: 'Bathrooms' },
                                { icon: '🚗', value: 'Yes', label: 'Parking' }
                            ]).map((spec, i) => (
                                <div key={i} style={{
                                    textAlign: 'center',
                                    padding: '14px 8px',
                                    backgroundColor: theme.light,
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{spec.icon}</div>
                                    <div style={{ fontSize: '20px', fontWeight: 700, color: theme.primary }}>
                                        {spec.value}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                                        {spec.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        flex: 1
                    }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: theme.secondary,
                            marginBottom: '14px',
                            letterSpacing: '0.5px'
                        }}>
                            KEY AMENITIES
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {amenities.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    color: '#374151',
                                    backgroundColor: theme.light,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 500
                                }}>
                                    <span style={{
                                        color: theme.primary,
                                        fontSize: '16px',
                                        fontWeight: 700
                                    }}>✓</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div style={{
                        background: theme.gradient,
                        padding: '24px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        boxShadow: '0 8px 25px rgba(199, 125, 88, 0.25)',
                        color: 'white'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            opacity: 0.9,
                            marginBottom: '6px'
                        }}>
                            Asking Price
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1 }}>
                            {formatPrice(data.price)}
                        </div>
                        {data.negotiable && (
                            <div style={{ fontSize: '14px', marginTop: '6px', opacity: 0.95, fontWeight: 500 }}>
                                Negotiable
                            </div>
                        )}
                    </div>

                    {/* Contact CTA */}
                    <div style={{
                        backgroundColor: theme.secondary,
                        color: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 15px rgba(45, 62, 69, 0.25)'
                    }}>
                        <span>📞</span> {formatContact(data.contact)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50px',
                backgroundColor: theme.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '2px'
            }}>
                {CONSTANTS.WEBSITE}
            </div>
        </div>
    );
};

// ============================================================================
// THEME 2: URBAN PROFESSIONAL (Navy & Gold)
// ============================================================================

const UrbanTemplate: React.FC<{ property: MarketingPropertyInput; id?: string }> = ({ property, id }) => {
    const theme = COLORS.urban;
    const data = useMemo(() => getPropertyData(property), [property]);
    const amenities = useMemo(() => getAmenities(property), [property]);

    return (
        <div id={id} style={{ ...TEMPLATE_STYLES.container, backgroundColor: theme.light }}>
            {/* Elegant Header */}
            <div style={{
                height: '90px',
                background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 50px',
                boxShadow: '0 4px 20px rgba(30, 58, 95, 0.15)'
            }}>
                <div>
                    <div style={{
                        fontSize: '13px',
                        color: 'rgba(255,255,255,0.8)',
                        marginBottom: '4px',
                        letterSpacing: '1px',
                        fontWeight: 500
                    }}>
                        PREMIUM LISTING
                    </div>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '1px'
                    }}>
                        {data.isPlot ? data.property_type : `${data.bedrooms} BHK ${data.property_type}`}
                    </div>
                </div>
                <div style={{
                    backgroundColor: theme.secondary,
                    color: theme.primary,
                    padding: '10px 24px',
                    borderRadius: '30px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(212, 165, 116, 0.3)'
                }}>
                    ✦ VERIFIED
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
                padding: '40px 50px',
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: '30px',
                height: 'calc(100% - 140px)'
            }}>
                {/* Left - Large Image */}
                <div style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    gridRow: 'span 2'
                }}>
                    <PropertyImage
                        src={data.images[0]}
                        alt={data.title}
                        overlay
                    />
                    <Watermark color="rgba(212, 165, 116, 0.15)" />

                    {/* Location Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: '25px',
                        left: '25px',
                        right: '25px',
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(10px)',
                        padding: '18px 22px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            color: theme.accent,
                            fontWeight: 600,
                            marginBottom: '4px',
                            letterSpacing: '0.5px'
                        }}>
                            LOCATION
                        </div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: theme.primary,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>📍</span>
                            {data.locality}, {data.city}
                        </div>
                    </div>

                    {/* Image Counter */}
                    <div style={{
                        position: 'absolute',
                        bottom: '25px',
                        right: '25px',
                        backgroundColor: 'rgba(30, 58, 95, 0.92)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        padding: '10px 18px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: 700,
                        border: '2px solid rgba(212, 165, 116, 0.5)'
                    }}>
                        1/{data.images.length} Photos
                    </div>
                </div>

                {/* Top Right - Property Details */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '20px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                    border: `2px solid ${theme.secondary}15`
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: theme.primary,
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: `2px solid ${theme.secondary}30`,
                        letterSpacing: '0.5px'
                    }}>
                        PROPERTY HIGHLIGHTS
                    </h2>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '14px',
                        marginBottom: '24px'
                    }}>
                        {(data.isPlot ? [
                            { icon: '�', value: data.carpet_area, label: 'sq.ft' },
                            { icon: '📜', value: 'Clear', label: 'Title' },
                            { icon: '🛣️', value: 'Yes', label: 'Road' }
                        ] : [
                            { icon: '�🛏️', value: data.bedrooms, label: 'Bedrooms' },
                            { icon: '🚿', value: data.bathrooms, label: 'Baths' },
                            { icon: '📐', value: data.carpet_area, label: 'sq.ft' }
                        ]).map((stat, i) => (
                            <div key={i} style={{
                                textAlign: 'center',
                                padding: '16px 8px',
                                backgroundColor: theme.light,
                                borderRadius: '12px',
                                border: `1px solid ${theme.secondary}20`
                            }}>
                                <div style={{ fontSize: '30px', marginBottom: '8px' }}>{stat.icon}</div>
                                <div style={{ fontSize: '22px', fontWeight: 800, color: theme.primary }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '4px' }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Amenities */}
                    <div>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: theme.secondary,
                            marginBottom: '12px',
                            letterSpacing: '0.5px'
                        }}>
                            AMENITIES
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {amenities.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    backgroundColor: theme.light,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 600
                                }}>
                                    <span style={{ color: theme.secondary, fontSize: '14px' }}>✦</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Right - Price & CTA */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px'
                }}>
                    {/* Price Card */}
                    <div style={{
                        background: theme.gradient,
                        padding: '32px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        boxShadow: '0 12px 35px rgba(30, 58, 95, 0.25)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative element */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '100px',
                            height: '100px',
                            backgroundColor: 'rgba(212, 165, 116, 0.2)',
                            borderRadius: '50%'
                        }} />

                        <div style={{
                            fontSize: '13px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            opacity: 0.9,
                            marginBottom: '10px',
                            fontWeight: 600
                        }}>
                            Asking Price
                        </div>
                        <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, marginBottom: '10px', position: 'relative', zIndex: 1 }}>
                            {formatPrice(data.price)}
                        </div>
                        {data.negotiable && (
                            <div style={{ fontSize: '15px', opacity: 0.95, fontWeight: 600 }}>
                                Negotiable
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        padding: '18px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 6px 20px rgba(30, 58, 95, 0.25)'
                    }}>
                        <span>📞</span> {formatContact(data.contact)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50px',
                backgroundColor: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.secondary,
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '2px'
            }}>
                {CONSTANTS.WEBSITE_DISPLAY} • {CONSTANTS.TAGLINE}
            </div>
        </div>
    );
};

// ============================================================================
// THEME 3: NATURE HARMONY (Sage Green & Earth Tones)
// ============================================================================

const NatureTemplate: React.FC<{ property: MarketingPropertyInput; id?: string }> = ({ property, id }) => {
    const theme = COLORS.nature;
    const data = useMemo(() => getPropertyData(property), [property]);
    const amenities = useMemo(() => getAmenities(property), [property]);

    return (
        <div id={id} style={{
            ...TEMPLATE_STYLES.container,
            backgroundColor: theme.light,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Organic Header */}
            <div style={{
                padding: '40px 50px 20px',
                background: `linear-gradient(to bottom, ${theme.light}, transparent)`,
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 800,
                            color: theme.primary,
                            letterSpacing: '1px',
                            marginBottom: '4px'
                        }}>
                            {CONSTANTS.BRAND_NAME}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: theme.secondary,
                            fontWeight: 500,
                            opacity: 0.8
                        }}>
                            Premium Properties
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        padding: '8px 18px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span>🌿</span> ECO-FRIENDLY
                    </div>
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    color: theme.secondary,
                    margin: '0 0 10px 0',
                    lineHeight: 1.2
                }}>
                    {data.isPlot ? 'Premium Plot' : `${data.bedrooms} BHK ${data.property_type}`}
                </h1>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '19px',
                    color: '#6B7280',
                    fontWeight: 500
                }}>
                    <span style={{ color: theme.primary, fontSize: '22px' }}>📍</span>
                    {data.locality}, {data.city}
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                padding: '0 50px 30px',
                display: 'flex',
                gap: '30px',
                flex: 1,
                minHeight: 0 // Prevent overflow
            }}>
                {/* Left - Image */}
                <div style={{
                    flex: 1.4,
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(122, 155, 118, 0.2)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <PropertyImage
                            src={data.images[0]}
                            alt={data.title}
                            overlay
                        />
                        <Watermark color="rgba(255, 255, 255, 0.1)" />
                    </div>

                    {/* Bottom Info Bar */}
                    <div style={{
                        background: 'linear-gradient(to top, rgba(74, 93, 78, 0.95), rgba(74, 93, 78, 0.8))',
                        padding: '20px 25px',
                        display: 'flex',
                        gap: '20px',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>Status</div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.status}</div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{data.isPlot ? 'Plot Area' : 'Carpet Area'}</div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.carpet_area} sq.ft</div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{data.isPlot ? 'Structure' : 'Furnished'}</div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>{data.isPlot ? 'Open Plot' : data.furnished}</div>
                        </div>
                    </div>
                </div>

                {/* Right - Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minHeight: 0 }}>
                    {/* Property Specs */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '18px',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.06)',
                        border: `2px solid ${theme.accent}`,
                        flexShrink: 0
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px'
                        }}>
                            {(data.isPlot ? [
                                { icon: '📐', value: data.carpet_area, label: 'Plot Area' },
                                { icon: '📜', value: 'Clear', label: 'Title' },
                                { icon: '🛣️', value: 'Yes', label: 'Road Touch' }
                            ] : [
                                { icon: '🛏️', value: data.bedrooms, label: 'Bedrooms' },
                                { icon: '🚿', value: data.bathrooms, label: 'Baths' },
                                { icon: '🚗', value: 'Yes', label: 'Parking' }
                            ]).map((spec, i) => (
                                <div key={i} style={{
                                    textAlign: 'center',
                                    padding: '10px 4px',
                                    backgroundColor: theme.light,
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{spec.icon}</div>
                                    <div style={{ fontSize: '18px', fontWeight: 800, color: theme.primary }}>
                                        {spec.value}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                                        {spec.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amenities - Flexible Height */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '18px',
                        boxShadow: '0 6px 25px rgba(0,0,0,0.06)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: theme.secondary,
                            marginBottom: '12px',
                            letterSpacing: '0.5px',
                            flexShrink: 0
                        }}>
                            KEY FEATURES
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
                            {amenities.slice(0, 5).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    backgroundColor: theme.light,
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    fontWeight: 600
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: theme.primary,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        ✓
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div style={{
                        background: theme.gradient,
                        padding: '20px',
                        borderRadius: '18px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(122, 155, 118, 0.25)',
                        color: 'white',
                        flexShrink: 0
                    }}>
                        <div style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            opacity: 0.9,
                            marginBottom: '4px'
                        }}>
                            Asking Price
                        </div>
                        <div style={{ fontSize: '38px', fontWeight: 900, lineHeight: 1 }}>
                            {formatPrice(data.price)}
                        </div>
                    </div>

                    {/* CTA */}
                    <div style={{
                        backgroundColor: theme.secondary,
                        color: 'white',
                        padding: '14px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 6px 20px rgba(74, 93, 78, 0.25)',
                        flexShrink: 0
                    }}>
                        <span>📞</span> {formatContact(data.contact)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                height: '40px',
                backgroundColor: theme.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                flexShrink: 0
            }}>
                WWW.SAUDAPAKKA.COM
            </div>
        </div>
    );
};

// ============================================================================
// THEME 4: PRESTIGE (Luxury Black & Champagne)
// ============================================================================

const PrestigeTemplate: React.FC<{ property: MarketingPropertyInput; id?: string }> = ({ property, id }) => {
    const theme = COLORS.prestige;
    const data = useMemo(() => getPropertyData(property), [property]);
    const amenities = useMemo(() => getAmenities(property), [property]);

    return (
        <div id={id} style={{
            ...TEMPLATE_STYLES.container,
            backgroundColor: theme.primary,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Luxury Header */}
            <div style={{
                padding: '40px 50px 20px',
                borderBottom: `3px solid ${theme.secondary}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div>
                    <div style={{
                        fontSize: '32px',
                        fontWeight: 900,
                        color: theme.secondary,
                        letterSpacing: '3px',
                        fontFamily: '"Playfair Display", Georgia, serif',
                        marginBottom: '4px'
                    }}>
                        {CONSTANTS.BRAND_NAME}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: theme.accent,
                        letterSpacing: '2px',
                        fontWeight: 600
                    }}>
                        PRESTIGE PROPERTIES
                    </div>
                </div>
                <div style={{
                    border: `2px solid ${theme.secondary}`,
                    color: theme.secondary,
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>✦</span> VERIFIED LISTING
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                padding: '30px 50px 30px',
                display: 'flex',
                gap: '30px',
                flex: 1,
                minHeight: 0 // Prevent overflow
            }}>
                {/* Left - Image */}
                <div style={{
                    flex: 1.5,
                    position: 'relative',
                    border: `3px solid ${theme.secondary}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <PropertyImage
                            src={data.images[0]}
                            alt={data.title}
                            overlay
                        />
                        <Watermark color="rgba(212, 175, 106, 0.12)" style={{ fontSize: '75px' }} />

                        {/* Elegant Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            padding: '30px',
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(212, 175, 106, 0.95)',
                                color: theme.primary,
                                padding: '12px 24px',
                                display: 'inline-block',
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '1px'
                            }}>
                                EXCLUSIVE LISTING
                            </div>
                        </div>
                    </div>

                    {/* Bottom Specs */}
                    <div style={{
                        backgroundColor: 'rgba(26, 26, 26, 1)',
                        padding: '25px 30px',
                        borderTop: `2px solid ${theme.secondary}`,
                        flexShrink: 0
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '20px',
                            color: 'white'
                        }}>
                            {(data.isPlot ? [
                                { label: 'Plot Area', value: `${data.carpet_area} sq.ft` },
                                { label: 'Title', value: 'Clear' },
                                { label: 'Road Touch', value: 'Yes' }
                            ] : [
                                { label: 'Bedrooms', value: data.bedrooms },
                                { label: 'Bathrooms', value: data.bathrooms },
                                { label: 'Carpet Area', value: `${data.carpet_area} sq.ft` }
                            ]).map((item, i) => (
                                <div key={i}>
                                    <div style={{
                                        fontSize: '11px',
                                        color: theme.secondary,
                                        marginBottom: '4px',
                                        letterSpacing: '1px',
                                        fontWeight: 600
                                    }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 800 }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right - Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', minHeight: 0 }}>
                    {/* Title */}
                    <div style={{
                        backgroundColor: theme.light,
                        padding: '24px',
                        border: `2px solid ${theme.secondary}`,
                        flexShrink: 0
                    }}>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 900,
                            color: theme.secondary,
                            margin: '0 0 10px 0',
                            lineHeight: 1.2,
                            fontFamily: '"Playfair Display", Georgia, serif'
                        }}>
                            {data.isPlot ? 'Premium Plot' : `${data.bedrooms} BHK`}
                        </h1>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 700,
                            color: theme.text,
                            margin: '0 0 10px 0'
                        }}>
                            Premium {data.property_type}
                        </h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '15px',
                            color: theme.accent,
                            fontWeight: 600
                        }}>
                            <span style={{ color: theme.secondary, fontSize: '18px' }}>📍</span>
                            {data.locality}, {data.city}
                        </div>
                    </div>

                    {/* Amenities - Flexible Height */}
                    <div style={{
                        backgroundColor: theme.light,
                        padding: '20px',
                        border: `1px solid ${theme.accent}`,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: theme.secondary,
                            marginBottom: '12px',
                            letterSpacing: '2px',
                            flexShrink: 0
                        }}>
                            PREMIUM FEATURES
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
                            {amenities.slice(0, 5).map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontSize: '13px',
                                    color: theme.text,
                                    backgroundColor: theme.primary,
                                    border: `1px solid ${theme.accent}`,
                                    padding: '10px 14px',
                                    fontWeight: 600
                                }}>
                                    <span style={{
                                        color: theme.secondary,
                                        fontSize: '14px',
                                        fontWeight: 700
                                    }}>✦</span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price */}
                    <div style={{
                        background: theme.gradient,
                        padding: '20px',
                        textAlign: 'center',
                        border: `3px solid ${theme.secondary}`,
                        boxShadow: `0 10px 35px ${theme.secondary}40`,
                        flexShrink: 0
                    }}>
                        <div style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: theme.primary,
                            marginBottom: '6px',
                            fontWeight: 700
                        }}>
                            Asking Price
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: 900, color: theme.primary, lineHeight: 1 }}>
                            {formatPrice(data.price)}
                        </div>
                    </div>

                    {/* CTA */}
                    <div style={{
                        backgroundColor: theme.secondary,
                        color: theme.primary,
                        padding: '16px',
                        textAlign: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: `0 6px 20px ${theme.secondary}40`,
                        flexShrink: 0
                    }}>
                        <span>📞</span> {formatContact(data.contact)}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                height: '40px',
                backgroundColor: theme.light,
                borderTop: `3px solid ${theme.secondary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.secondary,
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '3px',
                flexShrink: 0
            }}>
                {CONSTANTS.WEBSITE_DISPLAY}
            </div>
        </div>
    );
};

// ============================================================================
// THEME 5: MINIMAL TRUST (Clean Blue & White)
// ============================================================================

const MinimalTemplate: React.FC<{ property: MarketingPropertyInput; id?: string }> = ({ property, id }) => {
    const theme = COLORS.minimal;
    const data = useMemo(() => getPropertyData(property), [property]);
    const amenities = useMemo(() => getAmenities(property), [property]);

    return (
        <div id={id} style={{ ...TEMPLATE_STYLES.container, backgroundColor: theme.light }}>
            {/* Clean Header */}
            <div style={{
                padding: '35px 50px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid #E5E7EB`
            }}>
                <div style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: theme.primary,
                    letterSpacing: '1px'
                }}>
                    {CONSTANTS.BRAND_NAME}
                </div>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        padding: '8px 18px',
                        borderRadius: '25px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span>✓</span> VERIFIED
                    </div>
                    <div style={{
                        color: '#6B7280',
                        fontSize: '13px',
                        fontWeight: 600
                    }}>
                        ID: BP{Math.floor(Math.random() * 10000)}
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div style={{
                height: '420px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <PropertyImage
                    src={data.images[0]}
                    alt={data.title}
                    overlay
                />
                <Watermark />

                {/* Top Badges */}
                <div style={{
                    position: 'absolute',
                    top: '25px',
                    left: '50px',
                    right: '50px',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 20px',
                        borderRadius: '30px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: theme.secondary,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        {data.isPlot ? data.property_type : `${data.bedrooms} BHK ${data.property_type}`}
                    </div>
                    <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(10px)',
                        padding: '10px 18px',
                        borderRadius: '25px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: theme.primary,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        📷 1/{data.images.length}
                    </div>
                </div>

                {/* Bottom Title */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(30, 58, 95, 0.92), transparent)',
                    backdropFilter: 'blur(10px)',
                    padding: '35px 50px',
                    color: 'white'
                }}>
                    <h1 style={{
                        fontSize: '40px',
                        fontWeight: 900,
                        margin: '0 0 10px 0'
                    }}>
                        {data.isPlot ? 'Premium Plot' : `${data.bedrooms} BHK Premium Flat`}
                    </h1>
                    <div style={{
                        fontSize: '19px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: 0.95
                    }}>
                        <span>📍</span> {data.locality}, {data.city}, Maharashtra
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div style={{ padding: '35px 50px 50px' }}>
                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    marginBottom: '30px'
                }}>
                    {(data.isPlot ? [
                        { icon: '📐', label: `${data.carpet_area} sqft` },
                        { icon: '📜', label: 'Clear Title' },
                        { icon: '🛣️', label: 'Road Touch' }
                    ] : [
                        { icon: '🛏️', label: `${data.bedrooms} Bedrooms` },
                        { icon: '🚿', label: `${data.bathrooms} Bathroom` },
                        { icon: '📐', label: `${data.carpet_area} sqft` }
                    ]).map((stat, i) => (
                        <div key={i} style={{
                            backgroundColor: theme.primary,
                            color: 'white',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            boxShadow: '0 4px 15px rgba(59, 126, 161, 0.2)'
                        }}>
                            <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                            <span style={{ fontSize: '15px', fontWeight: 700 }}>{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
                    {/* Key Features */}
                    <div>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 800,
                            color: theme.secondary,
                            marginBottom: '16px'
                        }}>
                            Key Features
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px'
                        }}>
                            {amenities.map((item, i) => (
                                <div key={i} style={{
                                    backgroundColor: 'white',
                                    border: `2px solid ${theme.light}`,
                                    padding: '16px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                }}>
                                    <div style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        backgroundColor: theme.primary,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        flexShrink: 0
                                    }}>
                                        ✓
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Additional Info */}
                        <div style={{
                            marginTop: '20px',
                            backgroundColor: theme.light,
                            padding: '20px',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-around'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                                    Property Age
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.secondary }}>
                                    {data.status}
                                </div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: '#D1D5DB' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                                    Possession
                                </div>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.secondary }}>
                                    Immediate
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price & CTA */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Price */}
                        <div style={{
                            background: theme.gradient,
                            color: 'white',
                            padding: '32px',
                            borderRadius: '16px',
                            textAlign: 'center',
                            boxShadow: '0 10px 30px rgba(59, 126, 161, 0.25)',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                opacity: 0.9,
                                marginBottom: '8px',
                                fontWeight: 600
                            }}>
                                Best Price
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1, marginBottom: '8px' }}>
                                {formatPrice(data.price)}
                            </div>
                            {data.negotiable && (
                                <div style={{ fontSize: '15px', opacity: 0.95, fontWeight: 600 }}>
                                    Negotiable
                                </div>
                            )}
                        </div>

                        {/* CTA Buttons */}
                        <div style={{
                            backgroundColor: theme.secondary,
                            color: 'white',
                            padding: '18px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            fontSize: '20px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 6px 20px rgba(26, 54, 93, 0.25)'
                        }}>
                            <span>📞</span> {formatContact(data.contact)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50px',
                backgroundColor: theme.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '2px'
            }}>
                {CONSTANTS.WEBSITE_DISPLAY} • {CONSTANTS.TAGLINE}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN EXPORT COMPONENT
// ============================================================================

export const RichTemplate: React.FC<RichTemplateProps> = ({ property, templateStyle, id }) => {
    const elementId = id || 'marketing-template';

    const TemplateComponent = useMemo(() => {
        const templates = {
            elegant: ElegantTemplate,
            urban: UrbanTemplate,
            nature: NatureTemplate,
            prestige: PrestigeTemplate,
            minimal: MinimalTemplate
        };
        return templates[templateStyle] || ElegantTemplate;
    }, [templateStyle]);

    return <TemplateComponent property={property} id={elementId} />;
};

export default RichTemplate;
